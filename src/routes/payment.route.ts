import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import {
  // Stripe
  createStripePaymentIntent,
  confirmStripePayment,
  createStripePaymentIntentMulti,
  confirmStripePaymentMulti,
  // PayPal
  createPayPalOrder,
  capturePayPalOrder,
  createPayPalOrderMulti,
  capturePayPalOrderMulti,
  // Google Pay
  processGooglePayPayment,
  processGooglePayPaymentMulti,
  confirmGooglePayPaymentMulti,
  // Razorpay
  createRazorpayOrder,
  captureRazorpayPayment,
  createRazorpayOrderMulti,
  captureRazorpayPaymentMulti,
  // Utility
  getTransactionById,
  getUserTransactions,
  refundTransaction,
} from '../controllers/payment.controller';
import {
  paymentParamsSchema,
  transactionParamsSchema,
  stripeConfirmSchema,
  paypalCaptureSchema,
  googlePayProcessSchema,
  razorpayCaptureSchema,
  refundSchema,
  multiCoursePaymentSchema,
} from '../schemas/payment.schema';

const router = Router();

// STRIPE PAYMENT ROUTES
router.post(
  '/stripe/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createStripePaymentIntent
);

router.post(
  '/stripe/confirm',
  isAuthenticated,
  validateRequest({ body: stripeConfirmSchema }),
  confirmStripePayment
);

router.post(
  '/stripe/multi',
  isAuthenticated,
  validateRequest({ body: multiCoursePaymentSchema }),
  createStripePaymentIntentMulti
);

router.post(
  '/stripe/confirm-multi',
  isAuthenticated,
  validateRequest({ body: stripeConfirmSchema }),
  confirmStripePaymentMulti
);

// PAYPAL PAYMENT ROUTES
router.post(
  '/paypal/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createPayPalOrder
);

router.post(
  '/paypal/capture',
  isAuthenticated,
  validateRequest({ body: paypalCaptureSchema }),
  capturePayPalOrder
);

router.post(
  '/paypal/multi',
  isAuthenticated,
  validateRequest({ body: multiCoursePaymentSchema }),
  createPayPalOrderMulti
);

router.post(
  '/paypal/capture-multi',
  isAuthenticated,
  validateRequest({ body: paypalCaptureSchema }),
  capturePayPalOrderMulti
);

// GOOGLE PAY PAYMENT ROUTES
router.post(
  '/googlepay/process',
  isAuthenticated,
  validateRequest({ body: googlePayProcessSchema }),
  processGooglePayPayment
);

router.post(
  '/googlepay/process-multi',
  isAuthenticated,
  validateRequest({ body: googlePayProcessSchema }),
  processGooglePayPaymentMulti
);

router.post(
  '/googlepay/confirm-multi',
  isAuthenticated,
  validateRequest({ body: stripeConfirmSchema }),
  confirmGooglePayPaymentMulti
);

// RAZORPAY PAYMENT ROUTES
router.post(
  '/razorpay/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createRazorpayOrder
);

router.post(
  '/razorpay/capture',
  isAuthenticated,
  validateRequest({ body: razorpayCaptureSchema }),
  captureRazorpayPayment
);

router.post(
  '/razorpay/multi',
  isAuthenticated,
  validateRequest({ body: multiCoursePaymentSchema }),
  createRazorpayOrderMulti
);

router.post(
  '/razorpay/capture-multi',
  isAuthenticated,
  validateRequest({ body: razorpayCaptureSchema }),
  captureRazorpayPaymentMulti
);

// UTILITY ROUTES
router.get(
  '/transactions',
  isAuthenticated,
  getUserTransactions
);

router.get(
  '/transactions/:transactionId',
  isAuthenticated,
  validateRequest({ params: transactionParamsSchema }),
  getTransactionById
);

router.post(
  '/transactions/:transactionId/refund',
  isAuthenticated,
  validateRequest({
    params: transactionParamsSchema,
    body: refundSchema
  }),
  refundTransaction
);

export default router;
