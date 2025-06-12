// src/middlewares/role.middleware.ts
import { RequestHandler } from 'express';
import prisma from '../config/prisma';

export const isAdminOrInstructor: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: no user on request' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (user?.isAdmin) {
      return next();
    }

    const instructor = await prisma.instructor.findUnique({
      where: { userId },
      select: { id: true, isVerified: true },
    });
    if (instructor?.isVerified) {
      (req as any).instructorId = instructor.id;
      return next();
    }

    res.status(403).json({ error: 'Forbidden: requires admin or verified instructor' });
    return;
  } catch (err) {
    console.error('Error in isAdminOrInstructor middleware:', err);
    next(err);
  }
};