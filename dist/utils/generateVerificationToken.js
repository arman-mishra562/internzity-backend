"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateVerificationToken = (userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
};
exports.generateVerificationToken = generateVerificationToken;
