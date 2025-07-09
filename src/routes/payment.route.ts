import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import {
  createRazorpayOrder,
  captureRazorpayPayment,
  createPayPalOrder,
  capturePayPalOrder,
  processGooglePay,
} from '../controllers/payment.controller';
import {
  paymentParamsSchema,
  razorpaySchema,
  paypalSchema,
  googlePaySchema,
} from '../schemas/payment.schema';

const router = Router();

// Razorpay
router.post(
  '/razorpay/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createRazorpayOrder
);
router.post(
  '/razorpay/capture',
  isAuthenticated,
  validateRequest({ body: razorpaySchema }),  
  captureRazorpayPayment
);

// PayPal
router.post(
  '/paypal/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createPayPalOrder
);
router.post(
  '/paypal/capture/:courseId',
  isAuthenticated,
  validateRequest({ body: paypalSchema }),     
  capturePayPalOrder
);

// Google Pay
router.post(
  '/googlepay/:courseId',
  isAuthenticated,
  validateRequest({ body: googlePaySchema }), 
  processGooglePay
);

export default router;
