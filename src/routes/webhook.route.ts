import { Router } from 'express';
import { stripeWebhook } from '../services/stripe.service';
import { cashfreeWebhook } from '../services/cashfree.service';

const router = Router();

// Stripe webhook (use raw body parser in app.ts)
router.post('/stripe', stripeWebhook);

// Cashfree webhook
router.post('/cashfree', cashfreeWebhook);

export default router; 