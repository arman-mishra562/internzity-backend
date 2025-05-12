import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getCarouselData = async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { /* you may add a “isActive” flag if you like */ },
    include: { instructors: { include: { instructor: { include: { user: true } } } } },
  });
  const instructors = await prisma.instructor.findMany({
    where: { isVerified: true },
    include: { user: true },
  });
  res.json({ courses, instructors });
};
