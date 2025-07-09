import { z } from 'zod';

export const paymentParamsSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const razorpaySchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
});

export const paypalSchema = z.object({
  orderId: z.string(),
});

export const googlePaySchema = z.object({
  paymentToken: z.string(),
});