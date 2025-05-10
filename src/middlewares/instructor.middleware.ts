import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const isInstructor = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const instructor = await prisma.instructor.findUnique({
    where: { userId },
  });
  if (!instructor || !instructor.isVerified) {
    return res.status(403).json({ error: 'You must be a verified instructor' });
  }

  // Attach instructor id for downstream use
  ;(req as any).instructorId = instructor.id;
  next();
};
