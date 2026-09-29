import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

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

    const currentBike = await auth.user.ownedProducts
      ?.filter((item) => item.status === "ACTIVE")
      .sort(
        (a, b) =>
          new Date(b.acquiredAt).getTime() -
          new Date(a.acquiredAt).getTime()
      )[0];

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: auth.user.id,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        email: auth.user.email,
        status: auth.user.status,
        wallet: {
          balance: auth.user.wallet
            ? auth.user.wallet.balance.toString()
            : "0",
        },
        currentBike: currentBike
          ? {
              id: currentBike.id,
              status: currentBike.status,
              purchasePrice: currentBike.purchasePrice.toString(),
              acquiredAt: currentBike.acquiredAt,
              product: {
                id: currentBike.product.id,
                sku: currentBike.product.sku,
                name: currentBike.product.name,
                imageUrl: currentBike.product.imageUrl,
                miningReward: currentBike.product.miningReward.toString(),
                miningLimitPerDay: currentBike.product.miningLimitPerDay,
              },
            }
          : null,
        roles: auth.roles,
      },
    });
  } catch (error) {
    console.error("Authentication check error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify authentication.",
      },
      { status: 500 }
    );
  }
}