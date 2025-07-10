import { getCashfreeConfig, CASHFREE_CONFIG } from '../config/cashfree';
import prisma from '../config/prisma';
import { CFPaymentGateway, CFOrderRequest, CFCustomerDetails } from 'cashfree-pg-sdk-nodejs';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const cashfreeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signature = req.headers['x-webhook-signature'] as string;
        const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
        if (webhookSecret && signature) {
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(payload)
                .digest('hex');
            if (signature !== expectedSignature) {
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
        }
        const event = req.body;
        const orderId = event.order?.orderId || event.order?.order_id;
        // Mark enrollment as paid or update payment status as needed
        // Example: you might want to update a Payment or Enrollment record
        // await prisma.enrollment.updateMany({ where: { ... }, data: { status: 'PAID' } });
        res.json({ received: true });
    } catch (err) {
        next(err);
    }
};

// Utility function to create a Cashfree payment session and return the sessionId
export const createCashfreeCourseSession = async (
    userId: string,
    courseId: string
): Promise<{ sessionId?: string; error?: string; message?: string; data?: any }> => {
    // Fetch course and check if already enrolled
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return { error: 'Course not found' };
    }
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
    if (existingEnrollment) {
        return { message: 'Already enrolled', data: existingEnrollment };
    }
    // Check for active pending payment
    const now = new Date();
    const pendingPayment = await prisma.payment.findFirst({
        where: {
            userId,
            courseId,
            status: 'PENDING',
            expiresAt: { gt: now },
            gateway: 'CASHFREE',
        },
        orderBy: { createdAt: 'desc' },
    });
    const pendingSessionId = (pendingPayment?.metadata as { paymentSessionId?: string } | null)?.paymentSessionId;
    if (pendingSessionId) {
        return { sessionId: pendingSessionId };
    }
    // Create Cashfree order
    const cfConfig = getCashfreeConfig();
    const apiInstance = new CFPaymentGateway();
    const orderRequest = new CFOrderRequest();
    orderRequest.orderAmount = course.priceCents / 100;
    orderRequest.orderCurrency = 'INR';
    // Fetch user email/phone
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const customerDetails = new CFCustomerDetails();
    customerDetails.customerId = userId;
    customerDetails.customerEmail = user?.email || '';
    customerDetails.customerPhone = user?.profile_pic_url?.replace(/\D/g, '').slice(-10) || '0000000000';
    orderRequest.customerDetails = customerDetails;
    orderRequest.orderNote = `Course Purchase: ${course.title}`;
    orderRequest.orderMeta = {
        returnUrl: CASHFREE_CONFIG.RETURN_URL,
        notifyUrl: CASHFREE_CONFIG.CALLBACK_URL,
        paymentMethods: 'cc,dc,ppc,ccc,emi,paypal,upi,nb,app,paylater',
    };
    const orderResponse = await apiInstance.orderCreate(cfConfig, orderRequest);
    if (!orderResponse?.cfOrder?.paymentSessionId) {
        return { error: 'Cashfree order creation failed or returned invalid session.' };
    }
    const paymentSessionId = orderResponse.cfOrder.paymentSessionId;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    // Store payment record
    await prisma.payment.create({
        data: {
            userId,
            courseId,
            amount: course.priceCents / 100,
            currency: 'INR',
            gateway: 'CASHFREE',
            gatewayPaymentId: orderResponse?.cfOrder?.orderId,
            status: 'PENDING',
            metadata: { paymentSessionId },
            expiresAt,
        },
    });
    return { sessionId: paymentSessionId };
}; 