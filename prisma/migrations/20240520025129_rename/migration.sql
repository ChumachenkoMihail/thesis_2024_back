/*
  Warnings:

  - You are about to drop the column `realise` on the `bugs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bugs" DROP COLUMN "realise",
ADD COLUMN     "realize" TEXT;
