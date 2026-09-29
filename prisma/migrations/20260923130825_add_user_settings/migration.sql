-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "miningNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transactionNotifications" BOOLEAN NOT NULL DEFAULT true;
