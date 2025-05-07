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
  const courses = await prisma.course.findMany({
    include: { stream: true, instructors: { include: { instructor: { include: { user: true } } } } },
  });
  res.json(courses);
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
  const enrollment = await prisma.enrollment.create({ data: { userId, courseId } });
  res.status(201).json(enrollment);
};

export const wishlistCourse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id: courseId } = req.params;
  const wish = await prisma.wishlist.create({ data: { userId, courseId } });
  res.status(201).json(wish);
};
