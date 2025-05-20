"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountParamSchema = exports.updateDiscountSchema = exports.createDiscountSchema = void 0;
const zod_1 = require("zod");
exports.createDiscountSchema = zod_1.z.object({
    courseId: zod_1.z.string().cuid('Invalid course ID'),
    percent: zod_1.z.number().int().min(1, 'Percent must be at least 1').max(100, 'Max 100%'),
    validUntil: zod_1.z.string().optional(), // ISO date string or omitted
});
exports.updateDiscountSchema = zod_1.z.object({
    percent: zod_1.z.number().int().min(1, 'Percent must be at least 1').max(100, 'Max 100%').optional(),
    validUntil: zod_1.z.string().optional(), // ISO date string or omitted
}).refine(data => data.percent !== undefined || data.validUntil !== undefined, {
    message: 'At least one of percent or validUntil must be provided',
});
exports.discountParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid discount ID'),
});
