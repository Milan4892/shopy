import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    const [missions, user, walletTransactions, ownedBikes, miningRecords, referrals] =
      await Promise.all([
        prisma.mission.findMany({
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        }),

        prisma.walletTransaction.findMany({
          where: {
            userId,
            type: "DEPOSIT",
            status: "SUCCESS",
          },
          select: {
            id: true,
          },
          take: 1,
        }),

        prisma.userProduct.findMany({
          where: {
            userId,
          },
          select: {
            id: true,
          },
          take: 1,
        }),

        prisma.miningRecord.findMany({
          where: {
            userId,
          },
          select: {
            id: true,
          },
          take: 1,
        }),

        prisma.referral.count({
          where: {
            referrerId: userId,
          },
        }),
      ]);

    const existingCompletions =
      await prisma.missionCompletion.findMany({
        where: {
          userId,
        },
      });

    const completionMap = new Map(
      existingCompletions.map((completion) => [
        completion.missionId,
        completion,
      ])
    );

    const result = [];

    for (const mission of missions) {
      const existingCompletion = completionMap.get(mission.id);

      let progress = existingCompletion?.progress ?? 0;
      let completed = Boolean(existingCompletion?.completedAt);

      if (mission.title === "Complete Your Profile") {
        const profileComplete = Boolean(
          user?.firstName?.trim() &&
            user?.lastName?.trim() &&
            user?.email?.trim() &&
            user?.phone?.trim()
        );

        progress = profileComplete ? 1 : 0;
        completed = profileComplete;
      }

      if (mission.title === "Acquire Your First E-Bike") {
        const acquiredBike = ownedBikes.length > 0;

        progress = acquiredBike ? 1 : 0;
        completed = acquiredBike;
      }

      if (mission.title === "Fund Your Wallet") {
        const fundedWallet = walletTransactions.length > 0;

        progress = fundedWallet ? 1 : 0;
        completed = fundedWallet;
      }

      if (mission.title === "Mine Your E-Bike") {
        const minedBike = miningRecords.length > 0;

        progress = minedBike ? 1 : 0;
        completed = minedBike;
      }

      if (mission.title === "Refer 3 New Users") {
        progress = Math.min(referrals, mission.target);
        completed = referrals >= mission.target;
      }

      if (completed && !existingCompletion?.completedAt) {
        await prisma.missionCompletion.upsert({
          where: {
            missionId_userId: {
              missionId: mission.id,
              userId,
            },
          },
          update: {
            progress,
            completedAt: new Date(),
          },
          create: {
            missionId: mission.id,
            userId,
            progress,
            completedAt: new Date(),
          },
        });
      }

      result.push({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        reward: Number(mission.reward),
        target: mission.target,
        progress,
        completed,
      });
    }

    return NextResponse.json({
      success: true,
      missions: result,
    });
  } catch (error) {
    console.error("Missions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load missions.",
      },
      { status: 500 }
    );
  }
}