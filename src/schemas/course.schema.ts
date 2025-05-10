import { z } from 'zod';

export const createStreamSchema = z.object({
  name: z.string().min(1, 'Stream name is required'),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['LIVE', 'SELF_PACED']),
  priceCents: z.number().int().nonnegative('Price must be non-negative'),
  streamId: z.string().cuid('Invalid stream ID'),
  instructorIds: z.array(z.string().cuid()).min(1, 'At least one instructor required'),
});
