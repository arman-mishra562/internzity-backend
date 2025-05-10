import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createLecture = async (req: AuthRequest, res: Response) => {
    const { moduleId, title, videoUrl } = req.body;
    const instructorId = (req as any).instructorId as string;
  
    // 1) Look up the course for this module
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: { include: { instructors: true } } },
    });
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
  
    // 2) Check instructor is linked to that course
    const isAssigned = module.course.instructors.some(ci => ci.instructorId === instructorId);
    if (!isAssigned) {
      return res.status(403).json({ error: "You don't have permission on this module" });
    }
  
    // 3) Create the lecture
    const lecture = await prisma.lecture.create({
      data: { moduleId, title, videoUrl },
    });
    res.status(201).json(lecture);
  };

export const listLecturesForModule = async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const lectures = await prisma.lecture.findMany({
    where: { moduleId },
    include: { assignments: true },
  });
  res.json(lectures);
};
