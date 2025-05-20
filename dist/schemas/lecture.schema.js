"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lectureParamSchema = exports.moduleParamsSchema = exports.createLectureSchema = void 0;
const zod_1 = require("zod");
exports.createLectureSchema = zod_1.z.object({
    moduleId: zod_1.z.string().cuid('Invalid module ID'),
    title: zod_1.z.string().min(1, 'Lecture title is required'),
    videoUrl: zod_1.z.string().url('Must be a valid URL'),
});
exports.moduleParamsSchema = zod_1.z.object({
    moduleId: zod_1.z.string().cuid('Invalid module ID'),
});
exports.lectureParamSchema = zod_1.z.object({
    lectureId: zod_1.z.string().cuid("Invalid lecture ID"),
});
