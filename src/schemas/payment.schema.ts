import { z } from 'zod';

export const paymentParamsSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const transactionParamsSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
});

// Stripe schemas
export const stripeConfirmSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
});

// PayPal schemas
export const paypalCaptureSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  orderId: z.string().min(1, 'Order ID is required'),
});

// Google Pay schemas
export const googlePayProcessSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
  paymentToken: z.string().min(1, 'Payment token is required'),
});

// Razorpay schemas
export const razorpayCaptureSchema = z.object({
  transactionId: z.string().cuid('Invalid transaction ID'),
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