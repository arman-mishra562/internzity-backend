"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const password_schema_1 = require("../schemas/password.schema");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.get('/verify', auth_controller_1.verifyEmail);
router.post('/resend-verification', auth_controller_1.resendVerification);
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.post('/forgot-password', (0, validateRequest_1.default)({ body: password_schema_1.forgotPasswordSchema }), auth_controller_1.forgotPassword);
router.post('/reset-password', (0, validateRequest_1.default)({ body: password_schema_1.resetPasswordSchema }), auth_controller_1.resetPassword);
exports.default = router;
