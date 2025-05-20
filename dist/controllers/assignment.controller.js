"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAssignmentsForLecture = exports.createAssignment = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createAssignment = async (req, res, next) => {
    try {
        const { lectureId, title, description } = req.body;
        if (!lectureId || !title || !description) {
            res.status(400).json({ error: "lectureId, title, and description are required" });
            return;
        }
        // Optional: enforce that req.user exists / owns this lecture
        // const userId = req.user!.id;
        const assignment = await prisma_1.default.assignment.create({
            data: { lectureId, title, description },
        });
        res.status(201).json(assignment);
    }
    catch (err) {
        next(err);
    }
};
exports.createAssignment = createAssignment;
const listAssignmentsForLecture = async (req, res, next) => {
    try {
        const lectureId = req.params.lectureId;
        if (!lectureId) {
            res.status(400).json({ error: "Missing lectureId in URL params" });
            return;
        }
        const assignments = await prisma_1.default.assignment.findMany({
            where: { lectureId },
        });
        res.json(assignments);
    }
    catch (err) {
        next(err);
    }
};
exports.listAssignmentsForLecture = listAssignmentsForLecture;
