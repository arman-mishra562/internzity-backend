import prisma from '../config/prisma';
import { subDays, isSameDay, isYesterday } from 'date-fns';

export const streakService = {
  async get(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        maxStreak: true,
        lastActiveAt: true,
      },
    });
    return user;
  },

  async update(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, maxStreak: true, lastActiveAt: true },
    });
    if (!user) throw new Error('User not found');

    const now = new Date();
    let newStreak = 1;

    if (user.lastActiveAt) {
      if (isSameDay(user.lastActiveAt, now)) {
        // Already updated today -> no change
        newStreak = user.currentStreak;
      } else if (isYesterday(user.lastActiveAt)) {
        // Yesterday active —> increment
        newStreak = user.currentStreak + 1;
      } else {
        // Missed a day —> reset to 1
        newStreak = 1;
      }
    }

    const newMax = Math.max(user.maxStreak, newStreak);

    const updated = await prisma.user.update({
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