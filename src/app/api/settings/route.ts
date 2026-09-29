import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        emailNotifications: true,
        transactionNotifications: true,
        miningNotifications: true,
        marketingNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
      try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "emailNotifications",
      "transactionNotifications",
      "miningNotifications",
      "marketingNotifications",
    ];

    const data: Record<string, boolean> = {};

    for (const field of allowedFields) {
      if (typeof body[field] === "boolean") {
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings provided" },
        { status: 400 }
      );
    }

    const settings = await prisma.user.update({
      where: { id: auth.user.id },
      data,
      select: {
        emailNotifications: true,
        transactionNotifications: true,
        miningNotifications: true,
        marketingNotifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update settings" },
      { status: 500 }
    );
  }
}