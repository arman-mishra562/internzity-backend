"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.denyInstructor = exports.approveInstructor = exports.listPendingInstructors = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const listPendingInstructors = async (_req, res) => {
    const pending = await prisma_1.default.instructor.findMany({
        where: { isVerified: false },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(pending);
};
exports.listPendingInstructors = listPendingInstructors;
const approveInstructor = async (req, res) => {
    const { id } = req.params;
    const instructor = await prisma_1.default.instructor.update({
        where: { id },
        data: { isVerified: true },
    });
    res.json({ message: 'Instructor approved', instructor });
};
exports.approveInstructor = approveInstructor;
const denyInstructor = async (req, res) => {
    const { id } = req.params;
    // Option: delete or mark denied; we'll delete here
    await prisma_1.default.instructor.delete({ where: { id } });
    res.json({ message: 'Instructor denied and removed' });
};
exports.denyInstructor = denyInstructor;
