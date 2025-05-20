"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const isAdmin = async (req, res, next) => {
    try {
        // 1) Ensure auth middleware has run and attached req.user
        if (!req.user?.id) {
            res.status(401).json({ error: "Unauthorized: no user on request" });
            return;
        }
        // 2) Fetch from DB to double-check isAdmin flag
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { isAdmin: true },
        });
        if (!user?.isAdmin) {
            res.status(403).json({ error: "Forbidden: admin only" });
            return;
        }
        // 3) OK!
        next();
    }
    catch (err) {
        console.error("isAdmin middleware error:", err);
        next(err);
    }
};
exports.isAdmin = isAdmin;
