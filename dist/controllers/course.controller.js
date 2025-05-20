"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistCourse = exports.enrollCourse = exports.createCourse = exports.getCourse = exports.listCourses = exports.createStream = exports.listStreams = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listStreams = async (_req, res, next) => {
    try {
        const streams = await prisma_1.default.stream.findMany();
        res.json(streams);
    }
    catch (err) {
        next(err);
    }
};
exports.listStreams = listStreams;
const createStream = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Missing `name` in request body' });
            return;
        }
        const stream = await prisma_1.default.stream.create({ data: { name } });
        res.status(201).json(stream);
    }
    catch (err) {
        next(err);
    }
};
exports.createStream = createStream;
const listCourses = async (_req, res, next) => {
    try {
        const now = new Date();
        const courses = await prisma_1.default.course.findMany({
            include: {
                stream: true,
                instructors: {
                    include: { instructor: { include: { user: true } } },
                },
                discounts: true,
            },
        });
        const result = courses.map((c) => {
            const active = c.discounts
                .filter((d) => !d.validUntil || d.validUntil > now)
                .sort((a, b) => b.percent - a.percent)[0];
            const discountPercent = active?.percent ?? 0;
            const discountedPrice = Math.round((c.priceCents * (100 - discountPercent)) / 100);
            return {
                ...c,
                discountPercent,
                discountedPrice,
            };
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.listCourses = listCourses;
const getCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await prisma_1.default.course.findUnique({
            where: { id },
            include: {
                stream: true,
                instructors: {
                    include: { instructor: { include: { user: true } } },
                },
            },
        });
        if (!course) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json(course);
    }
    catch (err) {
        next(err);
    }
};
exports.getCourse = getCourse;
const createCourse = async (req, res, next) => {
    try {
        const { title, description, type, priceCents, streamId, instructorIds, } = req.body;
        // Basic validation
        if (!title ||
            !description ||
            !type ||
            priceCents == null ||
            !streamId ||
            !Array.isArray(instructorIds)) {
            res.status(400).json({
                error: 'Missing or invalid fields: title, description, type, priceCents, streamId, instructorIds',
            });
            return;
        }
        const course = await prisma_1.default.course.create({
            data: {
                title,
                description,
                type,
                priceCents,
                stream: { connect: { id: streamId } },
                instructors: {
                    create: instructorIds.map((instId) => ({
                        instructor: { connect: { id: instId } },
                    })),
                },
            },
            include: { instructors: true },
        });
        res.status(201).json(course);
    }
    catch (err) {
        next(err);
    }
};
exports.createCourse = createCourse;
const enrollCourse = async (req, res, next) => {
    try {
        // 1) Ensure authenticated
        if (!req.user?.id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const userId = req.user.id;
        // 2) Param validation
        const { id: courseId } = req.params;
        // 3) Check existing enrollment
        const existing = await prisma_1.default.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) {
            res.status(200).json({ message: 'Already enrolled', data: existing });
            return;
        }
        // 4) Enroll
        const enrollment = await prisma_1.default.enrollment.create({
            data: { userId, courseId },
        });
        res.status(201).json(enrollment);
    }
    catch (err) {
        next(err);
    }
};
exports.enrollCourse = enrollCourse;
const wishlistCourse = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const userId = req.user.id;
        const { id: courseId } = req.params;
        const existing = await prisma_1.default.wishlist.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existing) {
            res.status(200).json({ message: 'Already in wishlist', data: existing });
            return;
        }
        const wish = await prisma_1.default.wishlist.create({
            data: { userId, courseId },
        });
        res.status(201).json(wish);
    }
    catch (err) {
        next(err);
    }
};
exports.wishlistCourse = wishlistCourse;
