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

    const transactions = await prisma.walletTransaction.findMany({
      orderBy: {
        createdAt: "desc",
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
      },
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/wallet/transactions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wallet transactions.",
      },
      { status: 500 }
    );
  }
}