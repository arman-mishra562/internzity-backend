"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const prisma_1 = __importDefault(require("../config/prisma"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// PayPal environment
const paypalEnv = new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new checkout_server_sdk_1.default.core.PayPalHttpClient(paypalEnv);
exports.paymentService = {
    // 1. Create a payment order (Razorpay)
    async createRazorpayOrder(courseId) {
        const course = await prisma_1.default.course.findUniqueOrThrow({ where: { id: courseId } });
        const options = {
            amount: course.priceCents,
            currency: 'INR',
            receipt: `course_${courseId}_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        return { orderId: order.id, amount: order.amount, currency: order.currency };
    },
    // 2. Capture payment (Razorpay webhook or client side)
    async captureRazorpayPayment(orderId, paymentId) {
        // Optionally verify signature client-side; here we trust it
        await prisma_1.default.enrollment.create({
            data: { courseId: orderId.split('_')[1], userId: '' /* from controller */ },
        });
        return;
    },
    // 3. Create PayPal order
    async createPayPalOrder(courseId) {
        const course = await prisma_1.default.course.findUniqueOrThrow({ where: { id: courseId } });
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                    amount: { currency_code: 'USD', value: (course.priceCents / 100).toFixed(2) }
                }]
        });
        const order = await paypalClient.execute(request);
        return order.result;
    },
    // 4. Capture PayPal order
    async capturePayPalOrder(orderId, userId, courseId) {
        const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        const capture = await paypalClient.execute(request);
        // Record enrollment
        await prisma_1.default.enrollment.create({ data: { userId, courseId } });
        return capture.result;
    },
    // 5. Google Pay: client posts a token, we treat it like Razorpay
    async processGooglePay(token, courseId, userId) {
        // Normally you’d send `token` to your processor. Here, simulate success:
        await prisma_1.default.enrollment.create({ data: { userId, courseId } });
        return { success: true };
    }
};
