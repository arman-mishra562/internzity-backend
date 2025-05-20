"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseParamSchema = exports.createCourseSchema = exports.createStreamSchema = void 0;
const zod_1 = require("zod");
exports.createStreamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Stream name is required'),
});
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    type: zod_1.z.enum(['LIVE', 'SELF_PACED']),
    priceCents: zod_1.z.number().int().nonnegative('Price must be non-negative'),
    streamId: zod_1.z.string().cuid('Invalid stream ID'),
    instructorIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'At least one instructor required'),
});
exports.courseParamSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid course ID'),
});
