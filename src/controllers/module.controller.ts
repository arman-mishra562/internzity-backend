import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createModule = async (req: AuthRequest, res: Response) => {
    const { courseId, title } = req.body;
    const instructorId = (req as any).instructorId as string;
  
    // 1) Verify instructor-course link exists
    const link = await prisma.courseInstructor.findUnique({
      where: { courseId_instructorId: { courseId, instructorId } },
    });
    if (!link) {
      return res.status(403).json({ error: "You don't have permission on this course" });
    }
  
    // 2) Now safe to create the module
    const module = await prisma.module.create({ data: { courseId, title } });
    res.status(201).json(module);
  };

export const listModulesForCourse = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const modules = await prisma.module.findMany({
    where: { courseId },
  });
  res.json(modules);
};
