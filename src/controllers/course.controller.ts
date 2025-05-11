import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const listStreams = async (_req: Request, res: Response) => {
  const streams = await prisma.stream.findMany();
  res.json(streams);
};

export const createStream = async (req: Request, res: Response) => {
  const { name } = req.body;
  const stream = await prisma.stream.create({ data: { name } });
  res.status(201).json(stream);
};

export const listCourses = async (_req: Request, res: Response) => {
  const now = new Date();
  const courses = await prisma.course.findMany({
    include: {
      stream: true,
      instructors: { include: { instructor: { include: { user: true } } } },
      discounts: true,  // include related discounts
    },
  });

  // Apply the best active discount to each course
  const result = courses.map((c) => {
    const active = c.discounts
      .filter(d => !d.validUntil || d.validUntil > now)
      .sort((a, b) => b.percent - a.percent)[0];
    const discountPercent = active?.percent ?? 0;
    const discountedPrice = Math.round(c.priceCents * (100 - discountPercent) / 100);
    return { ...c, discountPercent, discountedPrice };
  });

  res.json(result);
};

export const getCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      stream: true,
      instructors: { include: { instructor: { include: { user: true } } } },
    },
  });
  res.json(course);
};

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, type, priceCents, streamId, instructorIds } = req.body;
  const course = await prisma.course.create({
    data: {
      title,
      description,
      type,
      priceCents,
      stream: { connect: { id: streamId } },
      instructors: {
        create: instructorIds.map((instId: string) => ({ instructor: { connect: { id: instId } } })),
      },
    },
    include: { instructors: true },
  });
  res.status(201).json(course);
};

export const enrollCourse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: courseId } = req.params;

  // 1. Check for existing enrollment
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (existing) {
    // Already enrolled → return 200 or 409 as you prefer
    return res.status(200).json({ message: 'Already enrolled', data: existing });
  }

  // 2. Otherwise create a new one
  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId }
  });
  return res.status(201).json(enrollment);
};

export const wishlistCourse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: courseId } = req.params;

  // 1. Check for existing wishlist entry
  const existing = await prisma.wishlist.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });

  if (existing) {
    // Already in wishlist → idempotent response
    return res.status(200).json({ message: 'Already in wishlist', data: existing });
  }

  // 2. Otherwise create a new one
  const wish = await prisma.wishlist.create({
    data: { userId, courseId }
  });
  return res.status(201).json(wish);
};
