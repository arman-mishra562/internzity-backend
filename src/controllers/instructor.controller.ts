import { Request, Response, NextFunction } from "express";
import { instructorService } from "../services/instructor.service";

export const applyInstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructor = await instructorService.apply(req.user.id, req.body);
    res.status(201).json({ message: "Application submitted", data: instructor });
  } catch (error) {
    next(error);
  }
};
