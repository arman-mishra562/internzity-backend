import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const canManageDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID' });
    }

    // 1) Admins can always proceed
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.isAdmin) return next();

    // 2) Determine the courseId
    let courseId: string | undefined;

    if (req.method === 'POST') {
      courseId = req.body?.courseId;
      if (!courseId) {
        return res.status(400).json({ error: 'Missing courseId in request body' });
      }
    } else {
      const discountId = req.params.id;
      if (!discountId) {
        return res.status(400).json({ error: 'Missing discount ID in request params' });
      }

      const discount = await prisma.discount.findUnique({
        where: { id: discountId },
        select: { courseId: true },
      });

      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      courseId = discount.courseId;
    }

    // 3) Verify instructor ownership
    const instructor = await prisma.instructor.findFirst({
      where: {
        userId,
        isVerified: true,
        courses: {
          some: {
            courseId,
          },
        },
      },
    });

    if (!instructor) {
      return res.status(403).json({
        error: 'Permission denied: Not a verified instructor for this course',
      });
    }

    // 4) Authorized
    return next();
  } catch (error) {
    console.error('Error in canManageDiscount middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
