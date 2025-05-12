import { z } from 'zod';

export const createNoteSchema = z.object({
  lectureId: z.string().cuid('Invalid lecture ID'),
  content: z.string().min(1, 'Note content is required'),
});

export const lectureParamsSchema = z.object({
  lectureId: z.string().cuid('Invalid lecture ID'),
});
