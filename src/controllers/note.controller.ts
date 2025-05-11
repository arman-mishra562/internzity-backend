import { RequestHandler } from 'express';
import prisma from '../config/prisma';

export const createNote: RequestHandler = async (req, res, next) => {
  try {
    // 1) Validate inputs
    const { lectureId, content } = req.body as {
      lectureId?: string;
      content?: string;
    };
    if (!lectureId || !content) {
      res
        .status(400)
        .json({ error: 'Missing required fields: lectureId, content' });
      return;
    }

    // 2) Grab authenticated user ID
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: no user on request' });
      return;
    }

    // 3) Create note
    const note = await prisma.note.create({
      data: { lectureId, content, userId },
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const listNotesForLecture: RequestHandler<{
  lectureId: string;
}> = async (req, res, next) => {
  try {
    // 1) Validate params
    const { lectureId } = req.params;
    if (!lectureId) {
      res.status(400).json({ error: 'Missing lectureId in params' });
      return;
    }

    // 2) Fetch notes + user info
    const notes = await prisma.note.findMany({
      where: { lectureId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(notes);
  } catch (err) {
    next(err);
  }
};

export const listNotesForUser: RequestHandler = async (req, res, next) => {
  try {
    // 1) Authenticated user
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: no user on request' });
      return;
    }

    // 2) Fetch notes + lecture info
    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        lecture: {
          select: { id: true, title: true, moduleId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (err) {
    next(err);
  }
};