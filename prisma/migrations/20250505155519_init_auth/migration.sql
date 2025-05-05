/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationTokenExpires` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified",
DROP COLUMN "verificationToken",
DROP COLUMN "verificationTokenExpires",
ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "emailTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
