import { Request, Response, NextFunction } from 'express'
import prisma from '../config/prisma'

export const isInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Grab current user ID (assumes a preceding auth middleware populated req.user)
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID' })
    }

    // 2) Look up instructor record
    const instructor = await prisma.instructor.findUnique({
      where: { userId },
    })

    // 3) Must exist and be verified
    if (!instructor || !instructor.isVerified) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You must be a verified instructor' })
    }

    // 4) Attach instructorId for downstream controllers
    ;(req as any).instructorId = instructor.id

    // 5) All good → next()
    return next()
  } catch (err) {
    console.error('Error in isInstructor middleware:', err)
    return res
      .status(500)
      .json({ error: 'Internal server error in instructor check' })
  }
}
