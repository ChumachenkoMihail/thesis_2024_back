/*
  Warnings:

  - You are about to drop the `environments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `epics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "environments" DROP CONSTRAINT "environments_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "environments" DROP CONSTRAINT "environments_userId_fkey";

-- DropForeignKey
ALTER TABLE "epics" DROP CONSTRAINT "epics_environmentId_fkey";

-- DropForeignKey
ALTER TABLE "epics" DROP CONSTRAINT "epics_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "epics" DROP CONSTRAINT "epics_userId_fkey";

-- DropTable
DROP TABLE "environments";

-- DropTable
DROP TABLE "epics";

-- CreateTable
CREATE TABLE "project_environments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "project_environments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_environments" ADD CONSTRAINT "project_environments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_environments" ADD CONSTRAINT "project_environments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
