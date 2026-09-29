import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const vipLevels = [
  {
    level: 4,
    name: "VIP 4",
    sku: "SHOPY-EBIKE-S9",
    required: 2,
    miningBonus: 10,
    allowance: 30000,
  },
  {
    level: 3,
    name: "VIP 3",
    sku: "SHOPY-EBIKE-S6",
    required: 2,
    miningBonus: 8,
    allowance: 10000,
  },
  {
    level: 2,
    name: "VIP 2",
    sku: "SHOPY-EBIKE-S5",
    required: 2,
    miningBonus: 5,
    allowance: 0,
  },
  {
    level: 1,
    name: "VIP 1",
    sku: "SHOPY-EBIKE-S4",
    required: 3,
    miningBonus: 3,
    allowance: 0,
  },
];

export async function GET(request: Request) {  try {
const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const bikes = await prisma.userProduct.findMany({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      select: {
        product: {
          select: {
            sku: true,
            name: true,
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

    const currentVip =
      vipLevels.find((vip) => counts[vip.sku] >= vip.required) ?? null;

    return NextResponse.json({
      success: true,
      vip: currentVip
        ? {
            level: currentVip.level,
            name: currentVip.name,
            miningBonus: currentVip.miningBonus,
            freeWithdrawal: true,
            hiddenFees: false,
            monthlyAllowance: currentVip.allowance,
          }
        : {
            level: 0,
            name: "No VIP",
            miningBonus: 0,
            freeWithdrawal: false,
            hiddenFees: false,
            monthlyAllowance: 0,
          },
      bikeCounts: counts,
      totalActiveBikes: bikes.length,
    });
  } catch (error) {
    console.error("VIP API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load VIP information.",
      },
      { status: 500 }
    );
  }
}