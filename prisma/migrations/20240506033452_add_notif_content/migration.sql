-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "content" "NotificationsContent" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "status" SET DEFAULT 'UNREAD';
