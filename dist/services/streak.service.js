"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streakService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const date_fns_1 = require("date-fns");
exports.streakService = {
    async get(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                currentStreak: true,
                maxStreak: true,
                lastActiveAt: true,
            },
        });
        return user;
    },
    async update(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true, maxStreak: true, lastActiveAt: true },
        });
        if (!user)
            throw new Error('User not found');
        const now = new Date();
        let newStreak = 1;
        if (user.lastActiveAt) {
            if ((0, date_fns_1.isSameDay)(user.lastActiveAt, now)) {
                // Already updated today -> no change
                newStreak = user.currentStreak;
            }
            else if ((0, date_fns_1.isYesterday)(user.lastActiveAt)) {
                // Yesterday active —> increment
                newStreak = user.currentStreak + 1;
            }
            else {
                // Missed a day —> reset to 1
                newStreak = 1;
            }
        }
        const newMax = Math.max(user.maxStreak, newStreak);
        const updated = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                currentStreak: newStreak,
                maxStreak: newMax,
                lastActiveAt: now,
            },
            select: {
                currentStreak: true,
                maxStreak: true,
                lastActiveAt: true,
            },
        });
        return updated;
    },
};
