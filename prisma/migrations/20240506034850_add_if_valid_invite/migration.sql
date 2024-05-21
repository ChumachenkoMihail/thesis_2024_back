-- CreateEnum
CREATE TYPE "InviteExpired" AS ENUM ('VALID', 'INVALID');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "valid" "InviteExpired" DEFAULT 'VALID';
