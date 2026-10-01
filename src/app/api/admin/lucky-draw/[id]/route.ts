
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
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

    if (!auth || !hasAnyAdminRole(auth.roles, ADMIN_ROLES)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const luckyDraw = await prisma.luckyDraw.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            referralCode: true,
            createdAt: true,
          },
        },
      },
    });

    if (!luckyDraw) {
      return NextResponse.json(
        {
          success: false,
          message: "Lucky draw record not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      luckyDraw,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/lucky-draw/[id] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch lucky draw record.",
      },
      { status: 500 }
    );
  }
}