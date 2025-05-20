"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGooglePay = exports.capturePayPalOrder = exports.createPayPalOrder = exports.captureRazorpayPayment = exports.createRazorpayOrder = void 0;
const payment_service_1 = require("../services/payment.service");
const createRazorpayOrder = async (req, res) => {
    const { courseId } = req.params;
    const order = await payment_service_1.paymentService.createRazorpayOrder(courseId);
    res.json(order);
};
exports.createRazorpayOrder = createRazorpayOrder;
const captureRazorpayPayment = async (req, res) => {
    const { paymentId, orderId } = req.body;
    await payment_service_1.paymentService.captureRazorpayPayment(orderId, paymentId);
    res.json({ success: true });
};
exports.captureRazorpayPayment = captureRazorpayPayment;
const createPayPalOrder = async (req, res) => {
    const { courseId } = req.params;
    const order = await payment_service_1.paymentService.createPayPalOrder(courseId);
    res.json(order);
};
exports.createPayPalOrder = createPayPalOrder;
const capturePayPalOrder = async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const capture = await payment_service_1.paymentService.capturePayPalOrder(orderId, userId, courseId);
    res.json(capture);
};
exports.capturePayPalOrder = capturePayPalOrder;
const processGooglePay = async (req, res) => {
    const { paymentToken } = req.body;
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const result = await payment_service_1.paymentService.processGooglePay(paymentToken, courseId, userId);
    res.json(result);
};
exports.processGooglePay = processGooglePay;
