"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canManageDiscount = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const canManageDiscount = async (req, res, next) => {
    try {
        // 1) Must be logged in
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized: missing user' });
            return;
        }
        // 2) Admins bypass all checks
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (user?.isAdmin) {
            next();
            return;
        }
        // 3) Determine target courseId
        let courseId;
        if (req.method === 'POST') {
            courseId = req.body.courseId;
            if (!courseId) {
                res.status(400).json({ error: 'Bad Request: missing courseId in body' });
                return;
            }
        }
        else {
            const discountId = req.params.id;
            if (!discountId) {
                res.status(400).json({ error: 'Bad Request: missing discount ID in params' });
                return;
            }
            const discount = await prisma_1.default.discount.findUnique({
                where: { id: discountId },
                select: { courseId: true },
            });
            if (!discount) {
                res.status(404).json({ error: 'Not Found: discount does not exist' });
                return;
            }
            courseId = discount.courseId;
        }
        // 4) Verify the user is a verified instructor on that course
        const instrLink = await prisma_1.default.courseInstructor.findFirst({
            where: {
                courseId,
                instructor: {
                    userId,
                    isVerified: true,
                },
            },
        });
        if (!instrLink) {
            res
                .status(403)
                .json({ error: 'Forbidden: you’re not a verified instructor for this course' });
            return;
        }
        // 5) Authorized!
        next();
    }
    catch (err) {
        console.error('canManageDiscount error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.canManageDiscount = canManageDiscount;
