import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const type = typeof body.type === "string" ? body.type.trim() : "";

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Title, message and type are required" },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        { error: "Title must not exceed 150 characters" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must not exceed 5000 characters" },
        { status: 400 }
      );
    }

    const customers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        roles: {
          some: {
            role: {
              code: "CUSTOMER",
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (customers.length === 0) {
      return NextResponse.json(
        { error: "No active customers found" },
        { status: 404 }
      );
    }

    const result = await prisma.notification.createMany({
      data: customers.map((customer) => ({
        userId: customer.id,
        title,
        message,
        type,
        isRead: false,
      })),
    });

    return NextResponse.json({
      message: "Announcement sent successfully",
      recipients: result.count,
    });
  } catch (error) {
    console.error("Admin notification broadcast error:", error);

    return NextResponse.json(
      { error: "Failed to send announcement" },
      { status: 500 }
    );
  }
}