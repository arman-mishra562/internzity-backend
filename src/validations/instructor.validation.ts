import { z } from 'zod';

export const applyInstructorSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters."),
  expertise: z.array(z.string().min(2)).min(1, "At least one expertise required."),
});