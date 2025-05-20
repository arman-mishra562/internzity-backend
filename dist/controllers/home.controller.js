"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarouselData = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getCarouselData = async (_req, res) => {
    const courses = await prisma_1.default.course.findMany({
        where: { /* you may add a “isActive” flag if you like */},
        include: { instructors: { include: { instructor: { include: { user: true } } } } },
    });
    const instructors = await prisma_1.default.instructor.findMany({
        where: { isVerified: true },
        include: { user: true },
    });
    res.json({ courses, instructors });
};
exports.getCarouselData = getCarouselData;
