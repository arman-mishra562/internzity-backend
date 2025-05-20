"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const payment_schema_1 = require("../schemas/payment.schema");
const router = (0, express_1.Router)();
// Razorpay
router.post('/razorpay/:courseId', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ params: payment_schema_1.paymentParamsSchema }), payment_controller_1.createRazorpayOrder);
router.post('/razorpay/capture', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: payment_schema_1.razorpaySchema }), payment_controller_1.captureRazorpayPayment);
// PayPal
router.post('/paypal/:courseId', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ params: payment_schema_1.paymentParamsSchema }), payment_controller_1.createPayPalOrder);
router.post('/paypal/capture/:courseId', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: payment_schema_1.paypalSchema }), payment_controller_1.capturePayPalOrder);
// Google Pay
router.post('/googlepay/:courseId', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: payment_schema_1.googlePaySchema }), payment_controller_1.processGooglePay);
exports.default = router;
