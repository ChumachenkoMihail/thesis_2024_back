/*
  Warnings:

  - You are about to drop the column `code` on the `bugs` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `bugs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bugs" DROP COLUMN "code",
DROP COLUMN "test",
ADD COLUMN     "codeAsText" TEXT,
ADD COLUMN     "testAsText" TEXT;
