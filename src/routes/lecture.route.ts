import { Router } from "express";
import { z } from 'zod';
import validateRequest from "../middlewares/validateRequest";
import { isAuthenticated } from "../middlewares/auth.middleware";
import { isInstructor } from '../middlewares/instructor.middleware';
import {
  createLecture,
  listLecturesForModule,
} from "../controllers/lecture.controller";
import { createLectureSchema, moduleParamsSchema } from "../schemas/lecture.schema";

const router = Router();

router.post(
  "/",
  isAuthenticated, isInstructor,
  validateRequest({ body: createLectureSchema }),
  createLecture
);

router.get(
  "/module/:moduleId",
  validateRequest({ params: moduleParamsSchema }),
  listLecturesForModule
);

export default router;
