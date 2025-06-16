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
  getWishlistedCourses,
  removeFromWishlist,
} from '../controllers/course.controller';
import { createStreamSchema, createCourseSchema, courseParamSchema } from '../schemas/course.schema';

const router = Router();

// Streams
router.get('/streams', listStreams);
router.post('/streams', isAuthenticated, isAdmin, validateRequest({ body: createStreamSchema }), createStream);

// Courses
router.get('/', listCourses);

// Wishlist (authenticated users)
router.get('/wishlist', isAuthenticated, getWishlistedCourses);

// Course by ID
router.get('/:id', validateRequest({ params: courseParamSchema }), getCourse);

// Create course (admin only)
router.post('/', isAuthenticated, isAdmin, validateRequest({ body: createCourseSchema }), createCourse);

// Enroll & add to Wishlist (authenticated users)
router.post('/:id/enroll', isAuthenticated, validateRequest({ params: courseParamSchema }), enrollCourse);
router.post('/:id/wishlist', isAuthenticated, validateRequest({ params: courseParamSchema }), wishlistCourse);
router.delete('/:id/wishlist', isAuthenticated, validateRequest({ params: courseParamSchema }), removeFromWishlist);

export default router;
