/*
  Warnings:

  - Added the required column `projectId` to the `bugs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attachmentType` to the `bugs_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BugAttachmentType" AS ENUM ('CODE', 'TEST', 'OTHER');

-- AlterTable
ALTER TABLE "bugs" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "bugs_attachments" ADD COLUMN     "attachmentType" "BugAttachmentType" NOT NULL;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
