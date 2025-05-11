import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import prisma from "../config/prisma";

export async function createAssignment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lectureId, title, description } = req.body;

    // optional: use req.user!.id to further authorize…
    const assignment = await prisma.assignment.create({
      data: { lectureId, title, description },
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

export async function listAssignmentsForLecture(
  req: AuthRequest,  // or plain Request if you prefer
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lectureId = req.params.lectureId;
    if (!lectureId) {
      res.status(400).json({ error: "Missing lectureId in URL" });
      return;
    }
    const assignments = await prisma.assignment.findMany({
      where: { lectureId },
    });
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}
