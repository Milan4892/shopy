import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
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

    const user = await prisma.user.findUnique({
      where: {
        id: auth.user.id,
      },
      select: {
        id: true,
        referralCode: true,
        firstName: true,
        lastName: true,
        referralsMade: {
          select: {
            id: true,
            createdAt: true,
            referredUser: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const referralCount = user.referralsMade.length;
    const target = 3;

    return NextResponse.json({
      success: true,
      referral: {
        code: user.referralCode,
        link: user.referralCode
          ? `${new URL(request.url).origin}/register?ref=${user.referralCode}`
          : null,
        count: referralCount,
        target,
        completed: referralCount >= target,
        reward: "1 S3 E-Bike FREE",
        referrals: user.referralsMade.map((referral) => ({
          id: referral.id,
          firstName: referral.referredUser.firstName,
          lastName: referral.referredUser.lastName,
          email: referral.referredUser.email,
          joinedAt: referral.referredUser.createdAt,
          referredAt: referral.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Referral load error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load referral information.",
      },
      { status: 500 }
    );
  }
}