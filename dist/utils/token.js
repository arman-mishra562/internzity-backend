"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = exports.generateAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const generateAuthToken = (userId) => {
    return jsonwebtoken_1.default.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateAuthToken = generateAuthToken;
const verifyAuthToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyAuthToken = verifyAuthToken;
