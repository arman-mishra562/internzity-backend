import stripe from '../config/stripe';
import prisma from '../config/prisma';
import { getClientIP, getCountryFromIP } from '../utils/geolocation';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export async function createStripeCourseSession(req: any, courseId: string, user: any) {
    // Fetch course and country-specific price
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { coursePrices: true }
    });
    if (!course) throw new Error('Course not found');

    const ip = getClientIP(req);
    const { country } = await getCountryFromIP(ip);
    const countryPrice = course.coursePrices.find((p) => p.country === country);
    const priceCents = countryPrice ? countryPrice.priceCents : course.priceCents;
    const currency = 'usd'; // Always use USD as currency

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: course.title,
                        description: course.description,
                    },
                    unit_amount: priceCents,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        customer_email: user.email,
        metadata: {
            courseId: course.id,
            userId: user.id,
        },
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    return session.url;
}

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    if (!stripe) {
        res.status(503).send('Stripe is not configured');
        return;
    }
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string,
        );
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const courseId = session.metadata?.courseId;
        const userId = session.metadata?.userId;
        // Mark enrollment as paid or update payment status as needed
        // Example: you might want to update a Payment or Enrollment record
        // await prisma.enrollment.updateMany({ where: { userId, courseId }, data: { status: 'PAID' } });
    }
    res.json({ received: true });
}; 