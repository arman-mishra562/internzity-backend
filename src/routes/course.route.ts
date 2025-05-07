import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/admin.middleware';
import {
  listStreams,
  createStream,
  listCourses,
  getCourse,
  createCourse,
  enrollCourse,
  wishlistCourse,
} from '../controllers/course.controller';
import { createStreamSchema, createCourseSchema, courseParamSchema } from '../schemas/course.schema';

const router = Router();

// Streams
router.get('/streams', listStreams);
router.post('/streams', isAuthenticated, isAdmin, validateRequest(createStreamSchema), createStream);

// Courses
router.get('/', listCourses);
router.get('/:id', validateRequest(courseParamSchema), getCourse);

// Create course (admin only)
router.post('/', isAuthenticated, isAdmin, validateRequest(createCourseSchema), createCourse);

// Enroll & Wishlist (authenticated users)
router.post('/:id/enroll', isAuthenticated, validateRequest(courseParamSchema), enrollCourse);
router.post('/:id/wishlist', isAuthenticated, validateRequest(courseParamSchema), wishlistCourse);

export default router;
