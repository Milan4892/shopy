import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required.",
        },
        { status: 400 }
      );
    }

    if (id === auth.session.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot logout your current session from here.",
        },
        { status: 400 }
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        id,
        userId: auth.user.id,
        status: "ACTIVE",
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Active session not found.",
        },
        { status: 404 }
      );
    }

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        status: "REVOKED",
      },
    });

    await prisma.notification.create({
      data: {
        userId: auth.user.id,
        title: "Session Logged Out",
        message:
          "An active session was logged out from your account.",
        type: "SECURITY",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Session logged out successfully.",
    });
  } catch (error) {
    console.error("Logout session error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout session.",
      },
      { status: 500 }
    );
  }
}