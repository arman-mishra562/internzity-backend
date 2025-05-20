"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const instructor_middleware_1 = require("../middlewares/instructor.middleware");
const module_controller_1 = require("../controllers/module.controller");
const module_schema_1 = require("../schemas/module.schema");
const router = (0, express_1.Router)();
// Instructors (only for their own courses)
router.post("/", auth_middleware_1.isAuthenticated, instructor_middleware_1.isInstructor, (0, validateRequest_1.default)({ body: module_schema_1.createModuleSchema }), module_controller_1.createModule);
router.get("/course/:courseId", (0, validateRequest_1.default)({ params: module_schema_1.courseParamsSchema }), module_controller_1.listModulesForCourse);
exports.default = router;
