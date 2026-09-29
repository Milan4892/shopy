import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
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

    const sessions = await prisma.session.findMany({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActiveAt: "desc",
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessions: sessions.map((session) => ({
        ...session,
        current: session.id === auth.session.id,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load active sessions.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const result = await prisma.session.updateMany({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
        id: {
          not: auth.session.id,
        },
      },
      data: {
        status: "REVOKED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "All other active sessions have been logged out.",
      count: result.count,
    });
  } catch (error) {
    console.error("Logout other sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout other sessions.",
      },
      { status: 500 }
    );
  }
}