-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "StartDate" TIMESTAMP(3),
ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false;
