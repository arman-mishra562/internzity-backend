"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const assignment_controller_1 = require("../controllers/assignment.controller");
const assignment_schema_1 = require("../schemas/assignment.schema");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.isAuthenticated, (0, validateRequest_1.default)({ body: assignment_schema_1.createAssignmentSchema }), assignment_controller_1.createAssignment);
router.get('/lecture/:lectureId', (0, validateRequest_1.default)({ params: assignment_schema_1.lectureParamsSchema }), assignment_controller_1.listAssignmentsForLecture);
exports.default = router;
