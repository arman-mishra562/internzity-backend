import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/prisma";

// createLecture now matches RequestHandler and propagates errors via next()
export const createLecture: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    // req.body typed by your validation middleware
    const { moduleId, title, videoUrl } = req.body;

    // instructorId injected by your auth middleware (make sure it's declared in Express.Request)
    const instructorId = (req as any).instructorId as string;
    if (!instructorId) {
      res.status(401).json({ error: "Unauthorized: Missing instructorId" });
      return;
    }

    // 1) Look up the module (and its course → instructors)
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: { include: { instructors: true } } },
    });
    if (!module) {
      res.status(404).json({ error: "Module not found" });
      return;
    }

    // 2) Check instructor is assigned to that course
    const isAssigned = module.course.instructors.some(
      (ci) => ci.instructorId === instructorId
    );
    if (!isAssigned) {
      res
        .status(403)
        .json({ error: "You don't have permission on this module" });
      return;
    }

    // 3) Create the lecture
    const lecture = await prisma.lecture.create({
      data: { moduleId, title, videoUrl },
    });

    res.status(201).json(lecture);
  } catch (err) {
    next(err);
  }
};

// listLecturesForModule also follows RequestHandler pattern
export const listLecturesForModule: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { moduleId } = req.params;
    if (!moduleId) {
      res.status(400).json({ error: "Missing moduleId in params" });
      return;
    }

    const lectures = await prisma.lecture.findMany({
      where: { moduleId },
      include: { assignments: true },
    });

    res.json(lectures);
  } catch (err) {
    next(err);
  }
};
