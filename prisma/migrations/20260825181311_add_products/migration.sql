/*
  Warnings:

  - Added the required column `miningReward` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "miningLimitPerDay" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "miningReward" DECIMAL(65,30) NOT NULL;
