"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.hostinger.com', // Hostinger SMTP server
    port: 465, // or 587 for non-secure
    secure: true, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER, // SMTP username from Hostinger
        pass: process.env.SMTP_PASS // SMTP password from Hostinger
    }
});
exports.default = transporter;
