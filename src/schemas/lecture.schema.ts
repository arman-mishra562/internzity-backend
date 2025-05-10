import { z } from 'zod';

export const createLectureSchema = z.object({
  moduleId: z.string().cuid('Invalid module ID'),
  title: z.string().min(1, 'Lecture title is required'),
  videoUrl: z.string().url('Must be a valid URL'),
});


export const lectureParamSchema = z.object({
    lectureId: z.string().cuid("Invalid lecture ID"),
});
