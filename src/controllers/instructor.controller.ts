import { Request, Response, NextFunction } from "express";
import { instructorService } from "../services/instructor.service";

export const applyInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const instructor = await instructorService.apply(req.user.id, req.body);
    res.status(201).json({ message: "Application submitted", data: instructor });
  } catch (error) {
    next(error);
  }
};
