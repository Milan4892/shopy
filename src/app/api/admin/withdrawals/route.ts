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

    const withdrawals = await prisma.withdrawal.findMany({
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
        bankAccount: true,
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("GET /api/admin/withdrawals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch withdrawals.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const withdrawalId = String(body.withdrawalId || "");

    if (!withdrawalId) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal ID is required.",
        },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: {
        id: withdrawalId,
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal not found.",
        },
        { status: 404 }
      );
    }

    if (
      withdrawal.status === "COMPLETED" ||
      withdrawal.status === "FAILED" ||
      withdrawal.status === "REJECTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `This withdrawal is already ${withdrawal.status.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    const updatedWithdrawal = await prisma.withdrawal.update({
      where: {
        id: withdrawalId,
      },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
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
        bankAccount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal marked as completed.",
      withdrawal: updatedWithdrawal,
    });
  } catch (error) {
    console.error("PATCH /api/admin/withdrawals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update withdrawal.",
      },
      { status: 500 }
    );
  }
}