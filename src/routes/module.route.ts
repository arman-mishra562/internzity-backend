import { Router } from "express";
import { z } from 'zod';
import validateRequest from "../middlewares/validateRequest";
import { isAuthenticated, AuthRequest } from "../middlewares/auth.middleware";
import { isInstructor } from '../middlewares/instructor.middleware';
import {
  createModule,
  listModulesForCourse,
} from "../controllers/module.controller";
import { createModuleSchema, moduleParamSchema } from "../schemas/module.schema";

const router = Router();

// Instructors (only for their own courses)
router.post(
  "/",
  isAuthenticated, isInstructor,
  validateRequest({ body: createModuleSchema }),
  createModule
);

router.get(
  "/course/:courseId",
  validateRequest({ params: moduleParamSchema.extend({ params: z.object({ courseId: z.string().cuid() }) }) }),
  listModulesForCourse
);

export default router;
