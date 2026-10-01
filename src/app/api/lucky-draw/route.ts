import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";

const rewards = [
  { type: "WALLET_CREDIT", value: 5000 },
  { type: "WALLET_CREDIT", value: 10000 },
  { type: "S3_EBIKE", value: 0 },
  { type: "S2_EBIKE", value: 0 },
  { type: "BETTER_LUCK", value: 0 },
];

function selectReward() {
  const index = Math.floor(Math.random() * rewards.length);
  return rewards[index];
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    const [bikeCount, previousSpin] = await Promise.all([
      prisma.userProduct.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      }),
      prisma.luckyDraw.findFirst({
        where: {
          userId,
        },
        orderBy: {
          spunAt: "desc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      available: bikeCount >= 4 && !previousSpin,
      hasSpun: Boolean(previousSpin),
      result: previousSpin
        ? {
            rewardType: previousSpin.rewardType,
            rewardValue: previousSpin.rewardValue
              ? Number(previousSpin.rewardValue)
              : 0,
            spunAt: previousSpin.spunAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Lucky draw GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load lucky draw.",
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
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = auth.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const bikeCount = await tx.userProduct.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      });

      if (bikeCount < 4) {
        throw new Error("DRAW_NOT_AVAILABLE");
      }

      const previousSpin = await tx.luckyDraw.findFirst({
        where: {
          userId,
        },
      });

      if (previousSpin) {
        throw new Error("DRAW_ALREADY_USED");
      }

      const reward = selectReward();

      const spin = await tx.luckyDraw.create({
        data: {
          userId,
          rewardType: reward.type,
          rewardValue: reward.value,
        },
      });

      if (reward.type === "WALLET_CREDIT" && reward.value > 0) {
        const wallet = await tx.wallet.findUnique({
          where: {
            userId,
          },
        });

        if (!wallet) {
          throw new Error("WALLET_NOT_FOUND");
        }

        await tx.wallet.update({
          where: {
            id: wallet.id,
          },
          data: {
            balance: {
              increment: reward.value,
            },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId,
            walletId: wallet.id,
            reference: `LUCKY-${spin.id}`,
            gateway: "SYSTEM",
            type: "LUCKY_DRAW",
            status: "SUCCESS",
            amount: reward.value,
            currency: "NGN",
            description: "Lucky Draw reward",
          },
        });
      }

      return spin;
    });

    return NextResponse.json({
      success: true,
      message: "Lucky draw completed.",
      result: {
        rewardType: result.rewardType,
        rewardValue: result.rewardValue
          ? Number(result.rewardValue)
          : 0,
        spunAt: result.spunAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DRAW_NOT_AVAILABLE") {
        return NextResponse.json(
          {
            success: false,
            message: "Lucky draw is not available.",
          },
          { status: 403 }
        );
      }

      if (error.message === "DRAW_ALREADY_USED") {
        return NextResponse.json(
          {
            success: false,
            message: "Lucky draw has already been used.",
          },
          { status: 409 }
        );
      }
    }

    console.error("Lucky draw POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete lucky draw.",
      },
      { status: 500 }
    );
  }
}