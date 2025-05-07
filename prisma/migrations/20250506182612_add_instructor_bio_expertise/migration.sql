/*
  Warnings:

  - Added the required column `bio` to the `Instructor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Instructor" ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "expertise" TEXT[];
