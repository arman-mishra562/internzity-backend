import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  next();
};
