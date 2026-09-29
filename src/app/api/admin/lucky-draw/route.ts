import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
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