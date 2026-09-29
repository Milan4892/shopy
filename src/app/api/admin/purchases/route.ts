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

    const purchases = await prisma.userProduct.findMany({
      orderBy: {
        acquiredAt: "desc",
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
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            imageUrl: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      purchases,
    });
  } catch (error) {
    console.error("GET /api/admin/purchases error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch purchases.",
      },
      { status: 500 }
    );
  }
}