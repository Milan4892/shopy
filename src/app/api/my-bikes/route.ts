import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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

    const bikes = await prisma.userProduct.findMany({
      where: {
        userId: auth.user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        acquiredAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      bikes: bikes.map((bike) => ({
        id: bike.id,
        status: bike.status,
        purchasePrice: bike.purchasePrice.toString(),
        acquiredAt: bike.acquiredAt,
        product: {
          id: bike.product.id,
          sku: bike.product.sku,
          name: bike.product.name,
          description: bike.product.description,
          imageUrl: bike.product.imageUrl,
          speed: bike.product.speed,
          batteryRange: bike.product.batteryRange,
          miningReward: bike.product.miningReward.toString(),
          miningLimitPerDay: bike.product.miningLimitPerDay,
        },
      })),
    });
  } catch (error) {
    console.error("My bikes error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your bikes.",
      },
      { status: 500 }
    );
  }
}