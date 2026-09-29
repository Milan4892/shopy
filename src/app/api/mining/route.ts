import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function getVipMiningBonus(userId: string) {
  const bikes = await prisma.userProduct.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    select: {
      product: {
        select: {
          sku: true,
        },
      },
    },
  });

  const counts: Record<string, number> = {
    "SHOPY-EBIKE-S4": 0,
    "SHOPY-EBIKE-S5": 0,
    "SHOPY-EBIKE-S6": 0,
    "SHOPY-EBIKE-S9": 0,
  };

  for (const bike of bikes) {
    if (bike.product.sku in counts) {
      counts[bike.product.sku]++;
    }
  }

  if (counts["SHOPY-EBIKE-S9"] >= 2) {
    return 10;
  }

  if (counts["SHOPY-EBIKE-S6"] >= 2) {
    return 8;
  }

  if (counts["SHOPY-EBIKE-S5"] >= 2) {
    return 5;
  }

  if (counts["SHOPY-EBIKE-S4"] >= 3) {
    return 3;
  }

  return 0;
}

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

    const now = new Date();
    const dateKey = getDateKey(now);
    const weekend = isWeekend(now);

    const activeBike = await prisma.userProduct.findFirst({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      include: {
        product: true,
      },
      orderBy: {
        acquiredAt: "asc",
      },
    });

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: auth.user.id,
      },
    });

    if (!activeBike) {
      return NextResponse.json({
        success: true,
        bike: null,
        minedToday: 0,
        dailyLimit: 0,
        reward: "0",
        baseReward: "0",
        vipBonus: 0,
        balance: wallet?.balance.toString() || "0",
        canMine: false,
        isWeekend: weekend,
      });
    }

    const vipBonus = await getVipMiningBonus(auth.user.id);
    const baseReward = activeBike.product.miningReward;
    const reward = baseReward.mul(1 + vipBonus / 100);

    const minedToday = await prisma.miningRecord.count({
      where: {
        userId: auth.user.id,
        userProductId: activeBike.id,
        dateKey,
      },
    });

    const dailyLimit = activeBike.product.miningLimitPerDay;
    const canMine = !weekend && minedToday < dailyLimit;

    return NextResponse.json({
      success: true,
      bike: {
        id: activeBike.id,
        status: activeBike.status,
        product: {
          sku: activeBike.product.sku,
          name: activeBike.product.name,
          imageUrl: activeBike.product.imageUrl,
          miningReward: activeBike.product.miningReward.toString(),
          miningLimitPerDay: activeBike.product.miningLimitPerDay,
        },
      },
      minedToday,
      dailyLimit,
      reward: reward.toString(),
      baseReward: baseReward.toString(),
      vipBonus,
      balance: wallet?.balance.toString() || "0",
      canMine,
      isWeekend: weekend,
    });
  } catch (error) {
    console.error("Mining data error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load mining data.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const now = new Date();

    if (isWeekend(now)) {
      return NextResponse.json(
        {
          success: false,
          message: "Mining is unavailable on Saturdays and Sundays.",
        },
        { status: 400 }
      );
    }

    const dateKey = getDateKey(now);

    const activeBike = await prisma.userProduct.findFirst({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      include: {
        product: true,
      },
      orderBy: {
        acquiredAt: "asc",
      },
    });

    if (!activeBike) {
      return NextResponse.json(
        {
          success: false,
          message: "You need an active bike before you can mine.",
        },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: auth.user.id,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 400 }
      );
    }

    const dailyLimit = activeBike.product.miningLimitPerDay;

    const minedToday = await prisma.miningRecord.count({
      where: {
        userId: auth.user.id,
        userProductId: activeBike.id,
        dateKey,
      },
    });

    if (minedToday >= dailyLimit) {
      return NextResponse.json(
        {
          success: false,
          message: "You have reached your mining limit for today.",
        },
        { status: 400 }
      );
    }

    const vipBonus = await getVipMiningBonus(auth.user.id);
    const baseReward = activeBike.product.miningReward;
    const reward = baseReward.mul(1 + vipBonus / 100);

    const result = await prisma.$transaction(async (tx) => {
      const latestCount = await tx.miningRecord.count({
        where: {
          userId: auth.user.id,
          userProductId: activeBike.id,
          dateKey,
        },
      });

      if (latestCount >= dailyLimit) {
        throw new Error("MINING_LIMIT_REACHED");
      }

      const miningRecord = await tx.miningRecord.create({
        data: {
          userId: auth.user.id,
          userProductId: activeBike.id,
          amount: reward,
          dateKey,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: reward,
          },
        },
      });

      const reference = `SHOPY-MINE-${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}`;

      await tx.walletTransaction.create({
        data: {
          userId: auth.user.id,
          walletId: wallet.id,
          reference,
          gateway: "SHOPY",
          type: "MINING_REWARD",
          status: "SUCCESS",
          amount: reward,
          currency: "NGN",
          description: `Mining reward from ${activeBike.product.name}`,
        },
      });

      const mineMission = await tx.mission.findFirst({
        where: {
          title: "Mine Your E-Bike",
          isActive: true,
        },
      });

      if (mineMission) {
        const existingCompletion =
          await tx.missionCompletion.findUnique({
            where: {
              missionId_userId: {
                missionId: mineMission.id,
                userId: auth.user.id,
              },
            },
          });

        if (!existingCompletion) {
          await tx.missionCompletion.create({
            data: {
              missionId: mineMission.id,
              userId: auth.user.id,
              progress: 1,
              completedAt: new Date(),
            },
          });
        }
      }

      return {
        miningRecord,
        balance: updatedWallet.balance.toString(),
        reference,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Mining reward credited successfully.",
      reward: reward.toString(),
      baseReward: baseReward.toString(),
      vipBonus,
      balance: result.balance,
      mining: {
        id: result.miningRecord.id,
        dateKey,
        minedToday: minedToday + 1,
        dailyLimit,
      },
      transaction: {
        reference: result.reference,
        type: "MINING_REWARD",
        status: "SUCCESS",
        amount: reward.toString(),
      },
    });
  } catch (error) {
    console.error("Mining error:", error);

    if (error instanceof Error) {
      if (error.message === "MINING_LIMIT_REACHED") {
        return NextResponse.json(
          {
            success: false,
            message: "You have reached your mining limit for today.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete mining.",
      },
      { status: 500 }
    );
  }
}