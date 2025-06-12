import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/prisma";

// create a Lecture
export const createLecture: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { moduleId, title, videoUrl } = req.body;

    const instructorId = (req as any).instructorId as string;
    if (!instructorId) {
      res.status(401).json({ error: "Unauthorized: Missing instructorId" });
      return;
    }

    // 1) Look up the module 
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

    // 4) Update media linkiage
    if (videoUrl) {
      await prisma.media.update({
        where: { key: videoUrl },
        data: {
          entity: 'Lecture',
          entityId: lecture.id,
          linkedAt: new Date(),
        },
      });
    }

    res.status(201).json(lecture);
  } catch (err) {
    next(err);
  }
};

// list Lectures For Module 
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
