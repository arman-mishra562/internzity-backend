import { RequestHandler } from "express";
import prisma from "../config/prisma";

export const isInstructor: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    // 1) Grab current user ID (auth middleware should've set req.user)
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized: Missing user" });
      return;
    }
    const userId = req.user.id;

    // 2) Look up instructor record
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
    });

    // 3) Must exist and be verified
    if (!instructor || !instructor.isVerified) {
      res
        .status(403)
        .json({ error: "Forbidden: Must be a verified instructor" });
      return;
    }

    // 4) Attach instructorId for downstream
    req.instructorId = instructor.id;

    // 5) All good → next()
    next();
  } catch (err) {
    console.error("Error in isInstructor middleware:", err);
    next(err);
  }
};