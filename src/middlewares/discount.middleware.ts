
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const canManageDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // 1) Admins can always proceed
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.isAdmin) {
    return next();
  }

  // 2) Figure out which course this discount belongs to:
  let courseId: string;

  if (req.method === 'POST') {
    // Create: courseId comes in the body
    courseId = (req.body as any).courseId;
  } else {
    // PATCH/DELETE: discount ID is in req.params.id
    const discount = await prisma.discount.findUnique({
      where: { id: req.params.id },
      select: { courseId: true },
    });
    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }
    courseId = discount.courseId;
  }

  // 3) Check that the user is a verified instructor on that course
  const instructor = await prisma.instructor.findFirst({
    where: {
      userId,
      isVerified: true,
      courses: { some: { courseId } },
    },
  });
  if (!instructor) {
    return res.status(403).json({
      error: 'You do not have permission to manage discounts on this course',
    });
  }

  // 4) All good
  next();
};
