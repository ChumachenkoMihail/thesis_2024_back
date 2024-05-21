/*
  Warnings:

  - The values [MODILE] on the enum `platformEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "platformEnum_new" AS ENUM ('DESKTOP', 'TABLET', 'MOBILE', 'EMBEDDED', 'WEB');
ALTER TABLE "bugs" ALTER COLUMN "platform" TYPE "platformEnum_new" USING ("platform"::text::"platformEnum_new");
ALTER TYPE "platformEnum" RENAME TO "platformEnum_old";
ALTER TYPE "platformEnum_new" RENAME TO "platformEnum";
DROP TYPE "platformEnum_old";
COMMIT;
