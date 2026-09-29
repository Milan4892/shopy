import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const miningRecords = await prisma.miningRecord.findMany({
      orderBy: {
  minedAt: "desc",
},
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        userProduct: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                miningReward: true,
                miningLimitPerDay: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      miningRecords,
    });
  } catch (error) {
    console.error("GET /api/admin/mining error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch mining records.",
      },
      { status: 500 }
    );
  }
}