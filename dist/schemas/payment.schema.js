"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlePaySchema = exports.paypalSchema = exports.razorpaySchema = exports.paymentParamsSchema = void 0;
const zod_1 = require("zod");
exports.paymentParamsSchema = zod_1.z.object({
    courseId: zod_1.z.string().cuid('Invalid course ID'),
});
exports.razorpaySchema = zod_1.z.object({
    paymentId: zod_1.z.string(),
    orderId: zod_1.z.string(),
});
exports.paypalSchema = zod_1.z.object({
    orderId: zod_1.z.string(),
});
exports.googlePaySchema = zod_1.z.object({
    paymentToken: zod_1.z.string(),
});
