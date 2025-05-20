"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const streak_controller_1 = require("../controllers/streak.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protect both routes
router.get('/', auth_middleware_1.isAuthenticated, streak_controller_1.getStreak);
router.post('/', auth_middleware_1.isAuthenticated, streak_controller_1.updateStreak);
exports.default = router;
