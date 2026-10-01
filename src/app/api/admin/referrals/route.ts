import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !hasAnyAdminRole(auth.roles, ADMIN_ROLES)) {
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