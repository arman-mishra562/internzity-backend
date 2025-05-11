import { z } from 'zod';

export const createDiscountSchema = z.object({
    courseId: z.string().cuid('Invalid course ID'),
    percent: z.number().int().min(1, 'Percent must be at least 1').max(100, 'Max 100%'),
    validUntil: z.string().optional(), // ISO date string or omitted
});

export const updateDiscountSchema = z.object({
  percent: z.number().int().min(1, 'Percent must be at least 1').max(100, 'Max 100%').optional(),
  validUntil: z.string().optional(), // ISO date string or omitted
}).refine(data => data.percent !== undefined || data.validUntil !== undefined, {
  message: 'At least one of percent or validUntil must be provided',
});

export const discountParamSchema = z.object({
    id: z.string().cuid('Invalid discount ID'),
});
