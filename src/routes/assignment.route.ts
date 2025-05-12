import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import {
  createAssignment,
  listAssignmentsForLecture,
} from '../controllers/assignment.controller';
import {
  createAssignmentSchema,
  lectureParamsSchema,
} from '../schemas/assignment.schema';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  validateRequest({ body: createAssignmentSchema }),
  createAssignment
);

router.get(
  '/lecture/:lectureId',
  validateRequest({ params: lectureParamsSchema }),
  listAssignmentsForLecture
);

export default router;
