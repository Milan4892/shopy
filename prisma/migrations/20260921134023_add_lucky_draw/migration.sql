-- CreateTable
CREATE TABLE "LuckyDraw" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" DECIMAL(65,30),
    "spunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LuckyDraw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LuckyDraw_userId_idx" ON "LuckyDraw"("userId");

-- AddForeignKey
ALTER TABLE "LuckyDraw" ADD CONSTRAINT "LuckyDraw_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
