import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
];

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const isAdmin = auth.roles.includes("ADMIN");

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const status = String(body.status ?? "").trim();

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid account status.",
        },
        { status: 400 }
      );
    }

    if (id === auth.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "The admin account cannot be changed from here.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        roles: {
          none: {
            role: {
              code: "ADMIN",
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    if (user.status === status) {
      return NextResponse.json({
        success: true,
        message: `User is already ${status.toLowerCase()}.`,
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: status as "ACTIVE" | "SUSPENDED" | "DEACTIVATED",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action:
          status === "SUSPENDED"
            ? "USER_SUSPENDED"
            : status === "DEACTIVATED"
            ? "USER_DEACTIVATED"
            : "ADMIN_ACTION",
        description: `Admin changed user status from ${user.status} to ${status}.`,
        ipAddress:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip"),
        userAgent: request.headers.get("user-agent"),
        metadata: {
          previousStatus: user.status,
          newStatus: status,
          adminId: auth.user.id,
        },
      },
    });

    if (status !== "ACTIVE") {
      await prisma.session.updateMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `User ${status.toLowerCase()} successfully.`,
      user: {
        id: updatedUser.id,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error("Admin user status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update user status.",
      },
      { status: 500 }
    );
  }
}