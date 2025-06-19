import Razorpay from 'razorpay';
import paypal from '@paypal/checkout-server-sdk';
import Stripe from 'stripe';
import prisma from '../config/prisma';
import { PaymentMethod, TransactionStatus } from '@prisma/client';

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const paypalEnv = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID!,
  process.env.PAYPAL_CLIENT_SECRET!
);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export class PaymentError extends Error {
  constructor(message: string, public status: string = 'FAILED') {
    super(message);
    this.name = 'PaymentError';
  }
}

export const paymentService = {
  // Generic method to create a transaction record
  async createTransaction(
    userId: string,
    courseId: string,
    paymentMethod: PaymentMethod,
    amountCents: number,
    currency: string = 'USD'
  ) {
    return await prisma.transaction.create({
      data: {
        userId,
        courseId,
        amountCents,
        currency,
        paymentMethod,
        status: TransactionStatus.PENDING,
      },
    });
  },

  // Generic method to complete transaction and enrollment atomically
  async completeTransactionAndEnrollment(
    transactionId: string,
    gatewayOrderId: string,
    gatewayPaymentId: string,
    gatewayResponse: any
  ) {
    return await prisma.$transaction(async (tx) => {
      // Update transaction status
      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.COMPLETED,
          gatewayOrderId,
          gatewayPaymentId,
          gatewayResponse,
        },
      });

      // Check if enrollment already exists
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: transaction.userId,
            courseId: transaction.courseId,
          },
        },
      });

      if (existingEnrollment) {
        throw new PaymentError('User is already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await tx.enrollment.create({
        data: {
          userId: transaction.userId,
          courseId: transaction.courseId,
          transactionId: transaction.id,
        },
      });

      return { transaction, enrollment };
    });
  },

  // Generic method to fail transaction
  async failTransaction(transactionId: string, errorMessage: string) {
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.FAILED,
        errorMessage,
      },
    });
  },

  // 1. STRIPE PAYMENT METHODS
  async createStripePaymentIntent(courseId: string, userId: string) {
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });

    // Create transaction record
    const transaction = await this.createTransaction(
      userId,
      courseId,
      PaymentMethod.STRIPE,
      course.priceCents,
      'USD'
    );

    try {
      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.priceCents,
        currency: 'usd',
        metadata: {
          transactionId: transaction.id,
          courseId,
          userId,
        },
      });

      // Update transaction with Stripe order ID
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          gatewayOrderId: paymentIntent.id,
        },
      });

      return {
        transactionId: transaction.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      await this.failTransaction(transaction.id, error instanceof Error ? error.message : 'Stripe payment intent creation failed');
      throw new PaymentError('Failed to create Stripe payment intent');
    }
  },

  async confirmStripePayment(transactionId: string, paymentIntentId: string) {
    try {
      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentError('Payment not completed');
      }

      // Complete transaction and enrollment atomically
      const result = await this.completeTransactionAndEnrollment(
        transactionId,
        paymentIntentId,
        paymentIntent.latest_charge as string,
        paymentIntent
      );

      return result;
    } catch (error) {
      await this.failTransaction(transactionId, error instanceof Error ? error.message : 'Stripe payment confirmation failed');
      throw error;
    }
  },

  // 2. PAYPAL PAYMENT METHODS
  async createPayPalOrder(courseId: string, userId: string) {
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });

    // Create transaction record
    const transaction = await this.createTransaction(
      userId,
      courseId,
      PaymentMethod.PAYPAL,
      course.priceCents,
      'USD'
    );

    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: (course.priceCents / 100).toFixed(2)
          },
          custom_id: transaction.id, // Link to our transaction
        }]
      });

      const order = await paypalClient.execute(request);

      // Update transaction with PayPal order ID
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          gatewayOrderId: order.result.id,
        },
      });

      return {
        transactionId: transaction.id,
        orderId: order.result.id,
        amount: course.priceCents,
        currency: 'USD',
      };
    } catch (error) {
      await this.failTransaction(transaction.id, error instanceof Error ? error.message : 'PayPal order creation failed');
      throw new PaymentError('Failed to create PayPal order');
    }
  },

  async capturePayPalOrder(transactionId: string, orderId: string) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      const capture = await paypalClient.execute(request);

      if (capture.result.status !== 'COMPLETED') {
        throw new PaymentError('PayPal payment not completed');
      }

      // Complete transaction and enrollment atomically
      const result = await this.completeTransactionAndEnrollment(
        transactionId,
        orderId,
        capture.result.purchase_units[0].payments.captures[0].id,
        capture.result
      );

      return result;
    } catch (error) {
      await this.failTransaction(transactionId, error instanceof Error ? error.message : 'PayPal payment capture failed');
      throw error;
    }
  },

  // 3. GOOGLE PAY PAYMENT METHODS
  async createGooglePayOrder(courseId: string, userId: string) {
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });

    // Create transaction record
    const transaction = await this.createTransaction(
      userId,
      courseId,
      PaymentMethod.GOOGLE_PAY,
      course.priceCents,
      'USD'
    );

    return {
      transactionId: transaction.id,
      amount: course.priceCents,
      currency: 'USD',
      // Google Pay configuration for client
      googlePayConfig: {
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
        paymentMethodConfiguration: {
          paymentMethodType: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD'],
            billingAddressRequired: true,
            billingAddressParameters: {
              format: 'FULL',
              phoneNumberRequired: true,
            },
          },
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: (course.priceCents / 100).toFixed(2),
          currencyCode: 'USD',
          countryCode: 'US',
        },
      },
    };
  },

  async processGooglePayPayment(transactionId: string, paymentToken: string) {
    try {
      // In a real implementation, you would:
      // 1. Send the payment token to your payment processor
      // 2. Verify the payment with Google Pay
      // 3. Process the payment through your chosen processor (Stripe, etc.)

      // For now, we'll simulate a successful payment
      // In production, replace this with actual Google Pay processing

      // Simulate payment verification
      const mockPaymentId = `gp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Complete transaction and enrollment atomically
      const result = await this.completeTransactionAndEnrollment(
        transactionId,
        mockPaymentId,
        paymentToken,
        { paymentToken, processedAt: new Date().toISOString() }
      );

      return result;
    } catch (error) {
      await this.failTransaction(transactionId, error instanceof Error ? error.message : 'Google Pay payment processing failed');
      throw error;
    }
  },

  // 4. RAZORPAY PAYMENT METHODS (for Indian market)
  async createRazorpayOrder(courseId: string, userId: string) {
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });

    // Create transaction record
    const transaction = await this.createTransaction(
      userId,
      courseId,
      PaymentMethod.RAZORPAY,
      course.priceCents,
      'INR'
    );

    try {
      const options = {
        amount: course.priceCents,
        currency: 'INR',
        receipt: `course_${courseId}_${transaction.id}`,
        notes: {
          transactionId: transaction.id,
          courseId,
          userId,
        },
      };

      const order = await razorpay.orders.create(options);

      // Update transaction with Razorpay order ID
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          gatewayOrderId: order.id,
        },
      });

      return {
        transactionId: transaction.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      await this.failTransaction(transaction.id, error instanceof Error ? error.message : 'Razorpay order creation failed');
      throw new PaymentError('Failed to create Razorpay order');
    }
  },

  async captureRazorpayPayment(transactionId: string, orderId: string, paymentId: string, signature: string) {
    try {
      // Verify signature (in production, implement proper signature verification)
      // const expectedSignature = crypto
      //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      //   .update(orderId + '|' + paymentId)
      //   .digest('hex');

      // if (signature !== expectedSignature) {
      //   throw new PaymentError('Invalid payment signature');
      // }

      // Complete transaction and enrollment atomically
      const result = await this.completeTransactionAndEnrollment(
        transactionId,
        orderId,
        paymentId,
        { signature, verifiedAt: new Date().toISOString() }
      );

      return result;
    } catch (error) {
      await this.failTransaction(transactionId, error instanceof Error ? error.message : 'Razorpay payment capture failed');
      throw error;
    }
  },

  // 5. UTILITY METHODS
  async getTransactionById(transactionId: string) {
    return await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, priceCents: true } },
        enrollment: true,
      },
    });
  },

  async getUserTransactions(userId: string) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, thumbnail_url: true } },
        enrollment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async refundTransaction(transactionId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { enrollment: true },
    });

    if (!transaction) {
      throw new PaymentError('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new PaymentError('Transaction cannot be refunded');
    }

    return await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.REFUNDED,
          errorMessage: reason,
        },
      });

      // Remove enrollment if exists
      if (transaction.enrollment) {
        await tx.enrollment.delete({
          where: { id: transaction.enrollment.id },
        });
      }

      return updatedTransaction;
    });
  },
};
