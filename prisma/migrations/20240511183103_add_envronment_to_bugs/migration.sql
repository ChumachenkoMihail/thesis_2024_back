-- AlterTable
ALTER TABLE "bugs" ADD COLUMN     "environmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "bugs" ADD CONSTRAINT "bugs_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "project_environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
