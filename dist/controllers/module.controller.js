"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModulesForCourse = exports.createModule = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createModule = async (req, res, next) => {
    try {
        // 1) Validate input
        const { courseId, title } = req.body;
        if (!courseId || !title) {
            res.status(400).json({
                error: "Bad Request: Both courseId and title are required",
            });
            return;
        }
        // 2) Ensure user is authenticated
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: no user on request" });
            return;
        }
        // 3) Verify user is a verified instructor for the course
        const link = await prisma_1.default.courseInstructor.findFirst({
            where: {
                courseId,
                instructor: {
                    userId,
                    isVerified: true,
                },
            },
        });
        if (!link) {
            res
                .status(403)
                .json({ error: "Forbidden: you are not a verified instructor for this course" });
            return;
        }
        // 4) Create module
        const newModule = await prisma_1.default.module.create({
            data: { courseId, title },
        });
        res.status(201).json(newModule);
    }
    catch (err) {
        next(err);
    }
};
exports.createModule = createModule;
const listModulesForCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            res.status(400).json({ error: "Bad Request: courseId param is required" });
            return;
        }
        const modules = await prisma_1.default.module.findMany({
            where: { courseId },
            orderBy: { createdAt: "asc" },
        });
        res.json(modules);
    }
    catch (err) {
        next(err);
    }
};
exports.listModulesForCourse = listModulesForCourse;
