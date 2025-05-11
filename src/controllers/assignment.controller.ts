import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  const { lectureId, title, description } = req.body;
  // Optionally verify instructor permission on module/course...
  const assignment = await prisma.assignment.create({
    data: { lectureId, title, description },
  });
  res.status(201).json(assignment);
};

export const listAssignmentsForLecture = async (req: Request, res: Response) => {
  const { lectureId } = req.params;
  const assignments = await prisma.assignment.findMany({
    where: { lectureId },
  });
  res.json(assignments);
};
