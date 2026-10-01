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

    const luckyDraws = await prisma.luckyDraw.findMany({
      orderBy: {
        spunAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      luckyDraws,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/lucky-draw error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch lucky draw records.",
      },
      { status: 500 }
    );
  }
}