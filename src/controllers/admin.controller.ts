import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listPendingInstructors = async (_req: Request, res: Response) => {
  const pending = await prisma.instructor.findMany({
    where: { isVerified: false },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json(pending);
};

export const approveInstructor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const instructor = await prisma.instructor.update({
    where: { id },
    data: { isVerified: true },
  });
  res.json({ message: 'Instructor approved', instructor });
};

export const denyInstructor = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Option: delete or mark denied; we'll delete here
  await prisma.instructor.delete({ where: { id } });
  res.json({ message: 'Instructor denied and removed' });
};
