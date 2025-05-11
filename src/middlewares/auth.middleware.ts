import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAuthToken } from '../utils/token';
import prisma from '../config/prisma';

// extend Express Request to include authenticated user payload
export interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

// Middleware to protect routes and attach `req.user`
export const isAuthenticated: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAuthToken(token);

    // Ensure user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // attach user to request
    (req as AuthRequest).user = { id: payload.sub };
    next();
  } catch (error) {
    next(error);
  }
};
