
import { RequestHandler } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from './auth.middleware';  // wherever you declared it

export const isAdmin: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    // cast to AuthRequest to get at req.user.id
    const authReq = req as AuthRequest;

    if (!authReq.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
    });

    if (!user?.isAdmin) {
      res.status(403).json({ error: 'Admin only' });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
};