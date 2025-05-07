import { Router } from 'express';
import {
  listPendingInstructors,
  approveInstructor,
  denyInstructor,
} from '../controllers/admin.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All routes under /api/admin require auth + admin
router.use(isAuthenticated, isAdmin);

router.get('/instructors/pending', listPendingInstructors);
router.post('/instructors/:id/approve', approveInstructor);
router.post('/instructors/:id/deny', denyInstructor);

export default router;
