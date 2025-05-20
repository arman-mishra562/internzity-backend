"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const course_controller_1 = require("../controllers/course.controller");
const course_schema_1 = require("../schemas/course.schema");
const router = (0, express_1.Router)();
// Streams
router.get('/streams', course_controller_1.listStreams);
router.post('/streams', auth_middleware_1.isAuthenticated, admin_middleware_1.isAdmin, (0, validateRequest_1.default)({ body: course_schema_1.createStreamSchema }), course_controller_1.createStream);
// Courses
router.get('/', course_controller_1.listCourses);
router.get('/:id', (0, validateRequest_1.default)({ params: course_schema_1.courseParamSchema }), course_controller_1.getCourse);
// Create course (admin only)
router.post('/', auth_middleware_1.isAuthenticated, admin_middleware_1.isAdmin, (0, validateRequest_1.default)({ body: course_schema_1.createCourseSchema }), course_controller_1.createCourse);
// Enroll & Wishlist (authenticated users)
router.post('/:id/enroll', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ params: course_schema_1.courseParamSchema }), course_controller_1.enrollCourse);
router.post('/:id/wishlist', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ params: course_schema_1.courseParamSchema }), course_controller_1.wishlistCourse);
exports.default = router;
