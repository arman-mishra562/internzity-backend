-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "Lecture" ALTER COLUMN "videoUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_pic_url" TEXT;
