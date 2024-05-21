/*
  Warnings:

  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserId` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationsStatuses" AS ENUM ('READ', 'UNREAD');

-- CreateEnum
CREATE TYPE "NotificationsContent" AS ENUM ('INVITE', 'TEXT');

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "userId",
ADD COLUMN     "fromUserId" INTEGER NOT NULL,
ADD COLUMN     "status" "NotificationsStatuses" NOT NULL,
ADD COLUMN     "toUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
