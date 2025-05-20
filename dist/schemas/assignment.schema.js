"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lectureParamsSchema = exports.createAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.createAssignmentSchema = zod_1.z.object({
    lectureId: zod_1.z.string().cuid('Invalid lecture ID'),
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
});
exports.lectureParamsSchema = zod_1.z.object({
    lectureId: zod_1.z.string().cuid('Invalid lecture ID'),
});
