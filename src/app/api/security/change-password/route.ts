import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
export async function POST(request: Request) {
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

    const body = await request.json();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All password fields are required.",
        },
        { status: 400 }
      );
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All password fields are required.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New passwords do not match.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    const passwordValid = await bcrypt.compare(
      currentPassword,
      auth.user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 }
      );
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      12
    );

    const currentSessionId = auth.session.id;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: auth.user.id,
        },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      await tx.session.updateMany({
        where: {
          userId: auth.user.id,
          id: {
            not: currentSessionId,
          },
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
        },
      });

      await tx.notification.create({
        data: {
          userId: auth.user.id,
          title: "Password Changed",
          message:
            "Your Shoppy account password was changed successfully.",
          type: "SECURITY",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "Password changed successfully. Other active sessions have been logged out.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to change password.",
      },
      { status: 500 }
    );
  }
}