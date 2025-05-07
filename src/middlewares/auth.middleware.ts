import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken } from '../utils/token';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing or invalid token' });

    const token = authHeader.split(' ')[1];
    const payload = verifyAuthToken(token);

    // Ensure user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    // @ts-ignore
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
