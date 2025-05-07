import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const instructorService = {
  async apply(userId: string, data: { bio: string; expertise: string[] }) {
    // Prevent duplicate applications
    const existing = await prisma.instructor.findUnique({ where: { userId } });
    if (existing) throw new Error("Already applied or is an instructor.");

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
