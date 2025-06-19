import { z } from 'zod';

// Multi-course payment initiation schema
export const multiCoursePaymentSchema = z.object({
  courseIds: z.array(z.string().cuid('Invalid course ID')).min(1, 'At least one course ID is required'),
});

export const paymentParamsSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const transactionParamsSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
});

// Stripe schemas
export const stripeConfirmSchema = z.object({
  transactionIds: z.array(z.string().cuid('Invalid transaction ID')).min(1, 'At least one transaction ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

// PayPal schemas
export const paypalCaptureSchema = z.object({
  transactionIds: z.array(z.string().cuid('Invalid transaction ID')).min(1, 'At least one transaction ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
});

// Google Pay schemas
export const googlePayProcessSchema = z.object({
  transactionIds: z.array(z.string().cuid('Invalid transaction ID')).min(1, 'At least one transaction ID is required'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

// Razorpay schemas
export const razorpayCaptureSchema = z.object({
  transactionIds: z.array(z.string().cuid('Invalid transaction ID')).min(1, 'At least one transaction ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
});

// Refund schema
export const refundSchema = z.object({
  reason: z.string().min(1, 'Refund reason is required').max(500, 'Refund reason too long'),
});

// Legacy schemas for backward compatibility
export const razorpaySchema = razorpayCaptureSchema;
export const paypalSchema = paypalCaptureSchema;
export const googlePaySchema = googlePayProcessSchema;