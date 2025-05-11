// import { Request, Response, NextFunction } from 'express';
// import prisma from '../config/prisma';

// export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
//   const userId = (req as any).user?.id;
//   if (!userId) return res.status(401).json({ error: 'Unauthorized' });
//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
//   next();
// };
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