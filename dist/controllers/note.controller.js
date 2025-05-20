"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotesForUser = exports.listNotesForLecture = exports.createNote = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createNote = async (req, res, next) => {
    try {
        // 1) Validate inputs
        const { lectureId, content } = req.body;
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
        const note = await prisma_1.default.note.create({
            data: { lectureId, content, userId },
        });
        res.status(201).json(note);
    }
    catch (err) {
        next(err);
    }
};
exports.createNote = createNote;
const listNotesForLecture = async (req, res, next) => {
    try {
        // 1) Validate params
        const { lectureId } = req.params;
        if (!lectureId) {
            res.status(400).json({ error: 'Missing lectureId in params' });
            return;
        }
        // 2) Fetch notes + user info
        const notes = await prisma_1.default.note.findMany({
            where: { lectureId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(notes);
    }
    catch (err) {
        next(err);
    }
};
exports.listNotesForLecture = listNotesForLecture;
const listNotesForUser = async (req, res, next) => {
    try {
        // 1) Authenticated user
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: no user on request' });
            return;
        }
        // 2) Fetch notes + lecture info
        const notes = await prisma_1.default.note.findMany({
            where: { userId },
            include: {
                lecture: {
                    select: { id: true, title: true, moduleId: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notes);
    }
    catch (err) {
        next(err);
    }
};
exports.listNotesForUser = listNotesForUser;
