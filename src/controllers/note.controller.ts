import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createNote = async (req: AuthRequest, res: Response) => {
  const { lectureId, content } = req.body;
  const userId = req.user.id;
  const note = await prisma.note.create({
    data: { lectureId, content, userId },
  });
  res.status(201).json(note);
};

export const listNotesForLecture = async (req: Request, res: Response) => {
  const { lectureId } = req.params;
  const notes = await prisma.note.findMany({
    where: { lectureId },
    include: { user: { select: { id: true, name: true } } },
  });
  res.json(notes);
};

export const listNotesForUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const notes = await prisma.note.findMany({
    where: { userId },
    include: { lecture: true },
  });
  res.json(notes);
};
