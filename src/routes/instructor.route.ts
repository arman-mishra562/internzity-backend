import { Router } from "express";
import { applyInstructor } from "../controllers/instructor.controller";
import validateRequest from "../middlewares/validateRequest";
import { applyInstructorSchema } from "../validations/instructor.validation";
import { isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post(
    "/apply",
    isAuthenticated,
    validateRequest({ body: applyInstructorSchema }),
    applyInstructor
  );

export default router;
