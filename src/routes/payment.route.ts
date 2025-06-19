import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import {
  // Stripe
  createStripePaymentIntent,
  confirmStripePayment,
  // PayPal
  createPayPalOrder,
  capturePayPalOrder,
  // Google Pay
  createGooglePayOrder,
  processGooglePayPayment,
  // Razorpay
  createRazorpayOrder,
  captureRazorpayPayment,
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

// GOOGLE PAY PAYMENT ROUTES
router.post(
  '/googlepay/:courseId',
  isAuthenticated,
  validateRequest({ params: paymentParamsSchema }),
  createGooglePayOrder
);

router.post(
  '/googlepay/process',
  isAuthenticated,
  validateRequest({ body: googlePayProcessSchema }),
  processGooglePayPayment
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
