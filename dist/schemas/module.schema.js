"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleParamsSchema = exports.courseParamsSchema = exports.createModuleSchema = void 0;
const zod_1 = require("zod");
exports.createModuleSchema = zod_1.z.object({
    courseId: zod_1.z.string().cuid('Invalid course ID'),
    title: zod_1.z.string().min(1, 'Module title is required'),
});
exports.courseParamsSchema = zod_1.z.object({
    courseId: zod_1.z.string().cuid('Invalid course ID'),
});
exports.moduleParamsSchema = zod_1.z.object({
    moduleId: zod_1.z.string().cuid('Invalid module ID'),
});
