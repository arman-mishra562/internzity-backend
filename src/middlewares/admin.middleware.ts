import { RequestHandler } from "express";
import prisma from "../config/prisma";

export const isAdmin: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    // 1) Ensure auth middleware has run and attached req.user
    if (!req.user?.id) {
      res.status(401).json({ error: "Unauthorized: no user on request" });
      return;
    }

    // 2) Fetch from DB to double-check isAdmin flag
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      res.status(403).json({ error: "Forbidden: admin only" });
      return;
    }

    // 3) OK!
    next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    next(err);
  }
};