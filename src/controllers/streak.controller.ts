import { RequestHandler } from 'express';
import { streakService } from '../services/streak.service';

// GET streak info
export const getStreak: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = await streakService.get(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// POST streak update
export const updateStreak: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = await streakService.update(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
