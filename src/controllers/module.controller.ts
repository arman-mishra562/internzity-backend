import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/prisma";

export const createModule: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    // 1) Validate input
    const { courseId, title } = req.body as {
      courseId?: string;
      title?: string;
    };
    if (!courseId || !title) {
      res.status(400).json({
        error: "Bad Request: Both courseId and title are required",
      });
      return;
    }

    // 2) Ensure user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized: no user on request" });
      return;
    }

    // 3) Verify user is a verified instructor for the course
    const link = await prisma.courseInstructor.findFirst({
      where: {
        courseId,
        instructor: {
          userId,
          isVerified: true,
        },
      },
    });
    if (!link) {
      res
        .status(403)
        .json({ error: "Forbidden: you are not a verified instructor for this course" });
      return;
    }

    // 4) Create module
    const newModule = await prisma.module.create({
      data: { courseId, title },
    });
    res.status(201).json(newModule);
  } catch (err) {
    next(err);
  }
};

export const listModulesForCourse: RequestHandler<{ courseId: string }> = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      res.status(400).json({ error: "Bad Request: courseId param is required" });
      return;
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
    });
    res.json(modules);
  } catch (err) {
    next(err);
  }
};