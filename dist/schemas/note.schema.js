"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lectureParamsSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
exports.createNoteSchema = zod_1.z.object({
    lectureId: zod_1.z.string().cuid('Invalid lecture ID'),
    content: zod_1.z.string().min(1, 'Note content is required'),
});
exports.lectureParamsSchema = zod_1.z.object({
    lectureId: zod_1.z.string().cuid('Invalid lecture ID'),
});
