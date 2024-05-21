-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "organizationId" INTEGER;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "ogranizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
