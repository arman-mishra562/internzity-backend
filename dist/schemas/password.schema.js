"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = void 0;
const zod_1 = require("zod");
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().nonempty('Token is required'),
    newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
