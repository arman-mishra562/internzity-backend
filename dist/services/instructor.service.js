"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instructorService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.instructorService = {
    async apply(userId, data) {
        // Prevent duplicate applications
        const existing = await prisma.instructor.findUnique({ where: { userId } });
        if (existing)
            throw new Error("Already applied or is an instructor.");
        return await prisma.instructor.create({
            data: {
                userId,
                bio: data.bio,
                expertise: data.expertise,
                isVerified: false,
            },
        });
    },
};
