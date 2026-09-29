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

    const referrals = await prisma.referral.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            referralCode: true,
          },
        },
        referredUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      referrals,
    });
  } catch (error) {
    console.error("GET /api/admin/referrals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch referrals.",
      },
      { status: 500 }
    );
  }
}