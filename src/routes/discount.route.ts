import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest';
import { canManageDiscount } from '../middlewares/discount.middleware';
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from '../controllers/discount.controller';
import {
  createDiscountSchema,
  discountParamSchema,
  updateDiscountSchema
} from '../schemas/discount.schema';

const router = Router();

// All discount routes require authentication + per-course/instructor-or-admin check
router.use(isAuthenticated);

router.post(
  '/',
  validateRequest({ body: createDiscountSchema }),
  canManageDiscount,
  createDiscount
);

router.patch(
  '/:id',
  validateRequest({ params: discountParamSchema, body: updateDiscountSchema }),
  canManageDiscount,
  updateDiscount
);

router.delete(
  '/:id',
  validateRequest({ params: discountParamSchema }),
  canManageDiscount,
  deleteDiscount
);

export default router;
