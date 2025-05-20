"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const instructor_middleware_1 = require("../middlewares/instructor.middleware");
const lecture_controller_1 = require("../controllers/lecture.controller");
const lecture_schema_1 = require("../schemas/lecture.schema");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.isAuthenticated, instructor_middleware_1.isInstructor, (0, validateRequest_1.default)({ body: lecture_schema_1.createLectureSchema }), lecture_controller_1.createLecture);
router.get("/module/:moduleId", (0, validateRequest_1.default)({ params: lecture_schema_1.moduleParamsSchema }), lecture_controller_1.listLecturesForModule);
exports.default = router;
