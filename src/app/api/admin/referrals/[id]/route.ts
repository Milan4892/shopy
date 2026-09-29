import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const referral = await prisma.referral.findUnique({
      where: {
        id,
      },
      include: {
        referrer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            referralCode: true,
            status: true,
            createdAt: true,
          },
        },
        referredUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            referralCode: true,
            status: true,
            createdAt: true,
            referredUsers: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        {
          success: false,
          message: "Referral not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referral,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/referrals/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch referral.",
      },
      { status: 500 }
    );
  }
}