// src/controllers/module.controller.ts

import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// POST /api/modules
export const createModule: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId, title } = req.body;
    const instructorId = req.instructorId as string; 
    // (AuthRequest should already declare .instructorId)

    // 1) Verify instructor-course link exists
    const link = await prisma.courseInstructor.findUnique({
      where: { courseId_instructorId: { courseId, instructorId } },
    });
    if (!link) {
      res.status(403).json({ error: "You don't have permission on this course" });
      return;
    }

    // 2) Now safe to create the module
    const module = await prisma.module.create({
      data: { courseId, title },
    });
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:courseId/modules
export const listModulesForCourse: RequestHandler = async (
  req: Request<{ courseId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },  // optional ordering
    });

    res.json(modules);
  } catch (err) {
    next(err);
  }
};
