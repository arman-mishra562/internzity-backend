"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
// All routes under /api/admin require auth + admin
router.use(auth_middleware_1.isAuthenticated, admin_middleware_1.isAdmin);
router.get('/instructors/pending', admin_controller_1.listPendingInstructors);
router.post('/instructors/:id/approve', admin_controller_1.approveInstructor);
router.post('/instructors/:id/deny', admin_controller_1.denyInstructor);
exports.default = router;
