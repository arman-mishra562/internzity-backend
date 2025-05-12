import { Router } from "express";
import validateRequest from "../middlewares/validateRequest";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isInstructor } from '../middlewares/instructor.middleware';
import {
  createModule,
  listModulesForCourse,
} from "../controllers/module.controller";
import { createModuleSchema, courseParamsSchema } from "../schemas/module.schema";

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
  validateRequest({ params: courseParamsSchema }),
  listModulesForCourse
);

export default router;
