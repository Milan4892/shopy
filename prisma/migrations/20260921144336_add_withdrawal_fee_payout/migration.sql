/*
  Warnings:

  - Added the required column `payoutAmount` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "payoutAmount" DECIMAL(65,30) NOT NULL;
