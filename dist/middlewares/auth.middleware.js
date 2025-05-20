"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const token_1 = require("../utils/token");
const prisma_1 = __importDefault(require("../config/prisma"));
// 2) Protect routes & populate req.user
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
            return;
        }
        const token = authHeader.slice(7).trim(); // remove "Bearer "
        let payload;
        try {
            payload = (0, token_1.verifyAuthToken)(token);
        }
        catch (_err) {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return;
        }
        // 3) Confirm user still exists
        const user = await prisma_1.default.user.findUnique({ where: { id: payload.sub } });
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: User no longer exists' });
            return;
        }
        // 4) Attach to request
        req.user = { id: payload.sub };
        next();
    }
    catch (err) {
        console.error('Error in isAuthenticated middleware:', err);
        next(err);
    }
};
exports.isAuthenticated = isAuthenticated;
