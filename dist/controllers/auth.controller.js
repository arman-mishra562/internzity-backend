"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.login = exports.resendVerification = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const mailer_1 = __importDefault(require("../config/mailer"));
const generateVerificationToken_1 = require("../utils/generateVerificationToken");
const generateUserId_1 = require("../utils/generateUserId");
const emailTemplates_1 = require("../utils/emailTemplates");
const generateResetToken_1 = require("../utils/generateResetToken");
const emailTemplates_2 = require("../utils/emailTemplates");
const token_1 = require("../utils/token");
const auth_schema_1 = require("../schemas/auth.schema");
// Controller for user registration
const register = async (req, res, next) => {
    try {
        const parse = auth_schema_1.registerSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten().fieldErrors });
            return;
        }
        const { name, email, password } = parse.data;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const token = (0, generateVerificationToken_1.generateVerificationToken)(email);
        const expiry = new Date(Date.now() + 24 * 3600 * 1000);
        const newId = (0, generateUserId_1.generateUserId)();
        await prisma_1.default.user.create({
            data: { id: newId, name, email, password: hashed, emailToken: token, emailTokenExpiry: expiry },
        });
        const link = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
        await mailer_1.default.sendMail({
            from: `"InternZity" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Email',
            html: (0, emailTemplates_1.generateVerificationEmail)(link),
        });
        res.status(201).json({ message: 'Registered! Please check your email.' });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// Controller for email verification
const verifyEmail = async (req, res, next) => {
    try {
        const parse = auth_schema_1.verifySchema.safeParse(req.query);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten().fieldErrors });
            return;
        }
        const { token } = parse.data;
        const user = await prisma_1.default.user.findFirst({ where: { emailToken: token } });
        if (!user || !user.emailTokenExpiry || user.emailTokenExpiry < new Date()) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true, emailToken: null, emailTokenExpiry: null },
        });
        res.json({ message: 'Email verified successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyEmail = verifyEmail;
// Controller to resend verification email
const resendVerification = async (req, res, next) => {
    try {
        const parse = auth_schema_1.resendSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten().fieldErrors });
            return;
        }
        const { email } = parse.data;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.isEmailVerified) {
            res.status(400).json({ error: 'Email already verified' });
            return;
        }
        const token = (0, generateVerificationToken_1.generateVerificationToken)(email);
        const expiry = new Date(Date.now() + 24 * 3600 * 1000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { emailToken: token, emailTokenExpiry: expiry },
        });
        const link = `${process.env.BACKEND_URL}/api/auth/verify?token=${token}`;
        await mailer_1.default.sendMail({
            from: `"InternZity" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Resend: Verify Your Email',
            html: (0, emailTemplates_1.generateVerificationEmail)(link),
        });
        res.json({ message: 'Verification email resent' });
    }
    catch (err) {
        next(err);
    }
};
exports.resendVerification = resendVerification;
// Controller for user login
const login = async (req, res, next) => {
    try {
        const parse = auth_schema_1.loginSchema.safeParse(req.body);
        if (!parse.success) {
            res.status(400).json({ errors: parse.error.flatten().fieldErrors });
            return;
        }
        const { email, password } = parse.data;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.isEmailVerified) {
            res.status(403).json({ error: 'Email not verified' });
            return;
        }
        const token = (0, token_1.generateAuthToken)(user.id);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
//  Forgot Password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.json({ message: 'If that email is registered, you’ll receive a reset link.' });
        }
        const token = (0, generateResetToken_1.generateResetToken)(email);
        const expiry = new Date(Date.now() + 3600 * 1000); // 1 hour
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { resetToken: token, resetTokenExpiry: expiry },
        });
        const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await mailer_1.default.sendMail({
            from: `"InternZity" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password',
            html: (0, emailTemplates_2.generateResetEmail)(link),
        });
        res.json({ message: 'If that email is registered, you’ll receive a reset link.' });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
// Reset Password
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        // find user with matching token
        const user = await prisma_1.default.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired token' });
        }
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
// Controller for user logout
const logout = async (_req, res, next) => {
    try {
        // Stateless JWT – client discards token on their side
        res.json({ message: 'Logged out. Discard your token.' });
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
