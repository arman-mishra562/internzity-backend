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
  apiVersion: '2025-05-28.basil',
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

  // Multi-course STRIPE PAYMENT METHODS
  async createStripePaymentIntentMulti(courseIds: string[], userId: string) {
    // Fetch all courses
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    if (courses.length !== courseIds.length) {
      throw new PaymentError('One or more courses not found');
    }
    const totalAmount = courses.reduce((sum, c) => sum + c.priceCents, 0);
    // Create a PaymentIntent for the total
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: { userId, courseIds: courseIds.join(',') },
    });
    // Create a transaction record for each course
    const transactions = await Promise.all(
      courses.map(course =>
        prisma.transaction.create({
          data: {
            userId,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: 'USD',
            paymentMethod: PaymentMethod.STRIPE,
            status: TransactionStatus.PENDING,
            gatewayOrderId: paymentIntent.id,
          },
        })
      )
    );
    return {
      transactionIds: transactions.map(t => t.id),
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  },

  async confirmStripePaymentMulti(transactionIds: string[], paymentIntentId: string) {
    try {
      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentError('Payment not completed');
      }
      // Atomically complete all transactions and enrollments
      return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const transactionId of transactionIds) {
          // Update transaction status
          const transaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TransactionStatus.COMPLETED,
              gatewayOrderId: paymentIntentId,
              gatewayPaymentId: paymentIntent.latest_charge as string,
              gatewayResponse: paymentIntent,
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
            throw new PaymentError('User is already enrolled in one of the courses');
          }
          // Create enrollment
          const enrollment = await tx.enrollment.create({
            data: {
              userId: transaction.userId,
              courseId: transaction.courseId,
              transactionId: transaction.id,
            },
          });
          results.push({ transaction, enrollment });
        }
        return results;
      });
    } catch (error) {
      // Fail all transactions
      await Promise.all(
        transactionIds.map(id => this.failTransaction(id, error instanceof Error ? error.message : 'Stripe payment confirmation failed'))
      );
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

  // Multi-course PAYPAL PAYMENT METHODS
  async createPayPalOrderMulti(courseIds: string[], userId: string) {
    // Fetch all courses
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    if (courses.length !== courseIds.length) {
      throw new PaymentError('One or more courses not found');
    }
    const totalAmount = courses.reduce((sum, c) => sum + c.priceCents, 0);
    // Create PayPal order for the total
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (totalAmount / 100).toFixed(2),
        },
        custom_id: userId + ':' + courseIds.join(','),
      }],
    });
    const order = await paypalClient.execute(request);
    // Create a transaction record for each course
    const transactions = await Promise.all(
      courses.map(course =>
        prisma.transaction.create({
          data: {
            userId,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: 'USD',
            paymentMethod: PaymentMethod.PAYPAL,
            status: TransactionStatus.PENDING,
            gatewayOrderId: order.result.id,
          },
        })
      )
    );
    return {
      transactionIds: transactions.map(t => t.id),
      orderId: order.result.id,
      amount: totalAmount,
      currency: 'USD',
    };
  },

  async capturePayPalOrderMulti(transactionIds: string[], orderId: string) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      const capture = await paypalClient.execute(request);
      if (capture.result.status !== 'COMPLETED') {
        throw new PaymentError('PayPal payment not completed');
      }
      // Atomically complete all transactions and enrollments
      return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const transactionId of transactionIds) {
          // Update transaction status
          const transaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TransactionStatus.COMPLETED,
              gatewayOrderId: orderId,
              gatewayPaymentId: capture.result.purchase_units[0].payments.captures[0].id,
              gatewayResponse: capture.result,
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
            throw new PaymentError('User is already enrolled in one of the courses');
          }
          // Create enrollment
          const enrollment = await tx.enrollment.create({
            data: {
              userId: transaction.userId,
              courseId: transaction.courseId,
              transactionId: transaction.id,
            },
          });
          results.push({ transaction, enrollment });
        }
        return results;
      });
    } catch (error) {
      // Fail all transactions
      await Promise.all(
        transactionIds.map(id => this.failTransaction(id, error instanceof Error ? error.message : 'PayPal payment capture failed'))
      );
      throw error;
    }
  },

  // 3. GOOGLE PAY PAYMENT METHODS (via Stripe)
  async processGooglePayPaymentStripe(paymentMethodId: string, courseId: string, userId: string) {
    const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } });
    try {
      // Create a PaymentIntent with Stripe using the Google Pay payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: course.priceCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: { userId, courseId },
      });

      // Handle next actions if required (3DS, etc.)
      if (paymentIntent.status === 'requires_action') {
        return {
          requiresAction: true,
          paymentIntentClientSecret: paymentIntent.client_secret,
        };
      }

      // Mark transaction as complete, enroll user, etc.
      // You may want to call your completeTransactionAndEnrollment here if needed
      // For now, just return the paymentIntent
      return { success: true, paymentIntent };
    } catch (error: any) {
      throw new PaymentError(error.message || 'Failed to process Google Pay payment via Stripe');
    }
  },

  // Multi-course GOOGLE PAY PAYMENT METHODS (via Stripe)
  async processGooglePayPaymentStripeMulti(paymentMethodId: string, courseIds: string[], userId: string) {
    // Fetch all courses
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    if (courses.length !== courseIds.length) {
      throw new PaymentError('One or more courses not found');
    }
    const totalAmount = courses.reduce((sum, c) => sum + c.priceCents, 0);
    // Create a PaymentIntent with Stripe using the Google Pay payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: { userId, courseIds: courseIds.join(',') },
    });
    // Create a transaction record for each course
    const transactions = await Promise.all(
      courses.map(course =>
        prisma.transaction.create({
          data: {
            userId,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: 'USD',
            paymentMethod: PaymentMethod.STRIPE,
            status: TransactionStatus.PENDING,
            gatewayOrderId: paymentIntent.id,
          },
        })
      )
    );
    // Handle next actions if required (3DS, etc.)
    if (paymentIntent.status === 'requires_action') {
      return {
        requiresAction: true,
        paymentIntentClientSecret: paymentIntent.client_secret,
        transactionIds: transactions.map(t => t.id),
      };
    }
    return {
      transactionIds: transactions.map(t => t.id),
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  },

  async confirmGooglePayPaymentMulti(transactionIds: string[], paymentIntentId: string) {
    try {
      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentError('Payment not completed');
      }
      // Atomically complete all transactions and enrollments
      return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const transactionId of transactionIds) {
          // Update transaction status
          const transaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TransactionStatus.COMPLETED,
              gatewayOrderId: paymentIntentId,
              gatewayPaymentId: paymentIntent.latest_charge as string,
              gatewayResponse: paymentIntent,
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
            throw new PaymentError('User is already enrolled in one of the courses');
          }
          // Create enrollment
          const enrollment = await tx.enrollment.create({
            data: {
              userId: transaction.userId,
              courseId: transaction.courseId,
              transactionId: transaction.id,
            },
          });
          results.push({ transaction, enrollment });
        }
        return results;
      });
    } catch (error) {
      // Fail all transactions
      await Promise.all(
        transactionIds.map(id => this.failTransaction(id, error instanceof Error ? error.message : 'Google Pay payment confirmation failed'))
      );
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

  // Multi-course RAZORPAY PAYMENT METHODS
  async createRazorpayOrderMulti(courseIds: string[], userId: string) {
    // Fetch all courses
    const courses = await prisma.course.findMany({ where: { id: { in: courseIds } } });
    if (courses.length !== courseIds.length) {
      throw new PaymentError('One or more courses not found');
    }
    const totalAmount = courses.reduce((sum, c) => sum + c.priceCents, 0);
    // Create Razorpay order for the total
    const options = {
      amount: totalAmount,
      currency: 'INR',
      receipt: `multi_${userId}_${Date.now()}`,
      notes: {
        userId,
        courseIds: courseIds.join(','),
      },
    };
    const order = await razorpay.orders.create(options);
    // Create a transaction record for each course
    const transactions = await Promise.all(
      courses.map(course =>
        prisma.transaction.create({
          data: {
            userId,
            courseId: course.id,
            amountCents: course.priceCents,
            currency: 'INR',
            paymentMethod: PaymentMethod.RAZORPAY,
            status: TransactionStatus.PENDING,
            gatewayOrderId: order.id,
          },
        })
      )
    );
    return {
      transactionIds: transactions.map(t => t.id),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  },

  async captureRazorpayPaymentMulti(transactionIds: string[], orderId: string, paymentId: string, signature: string) {
    try {
      // (Optional) Verify signature here
      // Atomically complete all transactions and enrollments
      return await prisma.$transaction(async (tx) => {
        const results = [];
        for (const transactionId of transactionIds) {
          // Update transaction status
          const transaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TransactionStatus.COMPLETED,
              gatewayOrderId: orderId,
              gatewayPaymentId: paymentId,
              gatewayResponse: { signature, verifiedAt: new Date().toISOString() },
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
            throw new PaymentError('User is already enrolled in one of the courses');
          }
          // Create enrollment
          const enrollment = await tx.enrollment.create({
            data: {
              userId: transaction.userId,
              courseId: transaction.courseId,
              transactionId: transaction.id,
            },
          });
          results.push({ transaction, enrollment });
        }
        return results;
      });
    } catch (error) {
      // Fail all transactions
      await Promise.all(
        transactionIds.map(id => this.failTransaction(id, error instanceof Error ? error.message : 'Razorpay payment capture failed'))
      );
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
      },
    });
  },

  async getUserTransactions(userId: string) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, thumbnail_url: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async refundTransaction(transactionId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
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
      const enrollment = await tx.enrollment.findUnique({
        where: { transactionId },
      });
      if (enrollment) {
        await tx.enrollment.delete({
          where: { id: enrollment.id },
        });
      }

      return updatedTransaction;
    });
  },
};
