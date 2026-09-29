import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const read = searchParams.get("read") || "all";
    const type = searchParams.get("type") || "all";

    const where = {
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                message: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
      ...(read === "read"
        ? { isRead: true }
        : read === "unread"
          ? { isRead: false }
          : {}),
      ...(type !== "all" ? { type } : {}),
    };

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count(),
      prisma.notification.count({
        where: {
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      stats: {
        total,
        unread,
        read: total - unread,
      },
    });
  } catch (error) {
    console.error("Admin notifications GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}