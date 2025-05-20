"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const instructor_controller_1 = require("../controllers/instructor.controller");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const instructor_validation_1 = require("../validations/instructor.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/apply", auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: instructor_validation_1.applyInstructorSchema }), instructor_controller_1.applyInstructor);
exports.default = router;
