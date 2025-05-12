import { z } from 'zod';

export const createAssignmentSchema = z.object({
  lectureId: z.string().cuid('Invalid lecture ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

export const lectureParamsSchema = z.object({
  lectureId: z.string().cuid('Invalid lecture ID'),
});
