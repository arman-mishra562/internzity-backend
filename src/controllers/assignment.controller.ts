import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../config/prisma";

export const createAssignment: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { lectureId, title, description } = req.body;
    if (!lectureId || !title || !description) {
      res.status(400).json({ error: "lectureId, title, and description are required" });
      return;
    }

    // Optional: enforce that req.user exists / owns this lecture
    // const userId = req.user!.id;

    const assignment = await prisma.assignment.create({
      data: { lectureId, title, description },
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

export const listAssignmentsForLecture: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const lectureId = req.params.lectureId;
    if (!lectureId) {
      res.status(400).json({ error: "Missing lectureId in URL params" });
      return;
    }

    const assignments = await prisma.assignment.findMany({
      where: { lectureId },
    });

    res.json(assignments);
  } catch (err) {
    next(err);
  }
};
