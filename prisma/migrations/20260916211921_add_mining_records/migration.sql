-- CreateTable
CREATE TABLE "MiningRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userProductId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "minedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateKey" TEXT NOT NULL,

    CONSTRAINT "MiningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MiningRecord_userId_idx" ON "MiningRecord"("userId");

-- CreateIndex
CREATE INDEX "MiningRecord_userProductId_idx" ON "MiningRecord"("userProductId");

-- CreateIndex
CREATE INDEX "MiningRecord_dateKey_idx" ON "MiningRecord"("dateKey");

-- CreateIndex
CREATE INDEX "MiningRecord_userId_dateKey_idx" ON "MiningRecord"("userId", "dateKey");

-- AddForeignKey
ALTER TABLE "MiningRecord" ADD CONSTRAINT "MiningRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiningRecord" ADD CONSTRAINT "MiningRecord_userProductId_fkey" FOREIGN KEY ("userProductId") REFERENCES "UserProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
