"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyInstructorSchema = void 0;
const zod_1 = require("zod");
exports.applyInstructorSchema = zod_1.z.object({
    bio: zod_1.z.string().min(20, "Bio must be at least 20 characters."),
    expertise: zod_1.z.array(zod_1.z.string().min(2)).min(1, "At least one expertise required."),
});
