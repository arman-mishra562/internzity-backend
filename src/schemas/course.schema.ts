import { z } from 'zod';

export const createStreamSchema = z.object({
  body: z.object({ name: z.string().min(1) }),
});

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    type: z.enum(['LIVE', 'SELF_PACED']),
    priceCents: z.number().int().nonnegative(),
    streamId: z.string().cuid(),
    instructorIds: z.array(z.string().cuid()).min(1),
  }),
});

export const courseParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});
