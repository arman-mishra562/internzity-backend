import { z } from "zod";

export const createModuleSchema = z.object({
    courseId: z.string().cuid('Invalid course ID'),
    title: z.string().min(1, 'Module title is required'),
  });

export const courseParamsSchema = z.object({
  courseId: z.string().cuid('Invalid course ID'),
});

export const moduleParamsSchema = z.object({
  moduleId: z.string().cuid('Invalid module ID'),
});