"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStreak = exports.getStreak = void 0;
const streak_service_1 = require("../services/streak.service");
// GET streak info
const getStreak = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await streak_service_1.streakService.get(userId);
        res.json(data);
    }
    catch (err) {
        next(err);
    }
};
exports.getStreak = getStreak;
// POST streak update
const updateStreak = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await streak_service_1.streakService.update(userId);
        res.json(data);
    }
    catch (err) {
        next(err);
    }
};
exports.updateStreak = updateStreak;
