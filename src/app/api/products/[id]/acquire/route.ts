import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id,
        },
      });

      if (!product || !product.isActive) {
        throw new Error("BIKE_NOT_FOUND");
      }

      if (product.stock <= 0) {
        throw new Error("BIKE_OUT_OF_STOCK");
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          userId: auth.user.id,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (wallet.balance.lt(product.price)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const stockUpdate = await tx.product.updateMany({
        where: {
          id: product.id,
          stock: {
            gt: 0,
          },
        },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });

      if (stockUpdate.count !== 1) {
        throw new Error("BIKE_OUT_OF_STOCK");
      }

      const walletUpdate = await tx.wallet.updateMany({
        where: {
          userId: auth.user.id,
          balance: {
            gte: product.price,
          },
        },
        data: {
          balance: {
            decrement: product.price,
          },
        },
      });

      if (walletUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const ownedBike = await tx.userProduct.create({
        data: {
          userId: auth.user.id,
          productId: product.id,
          purchasePrice: product.price,
          status: "ACTIVE",
        },
        include: {
          product: true,
        },
      });

      const firstBikeMission = await tx.mission.findFirst({
        where: {
          title: "Acquire Your First E-Bike",
          isActive: true,
        },
      });

      if (firstBikeMission) {
        const existingCompletion = await tx.missionCompletion.findUnique({
          where: {
            missionId_userId: {
              missionId: firstBikeMission.id,
              userId: auth.user.id,
            },
          },
        });

        if (!existingCompletion) {
          await tx.missionCompletion.create({
            data: {
              missionId: firstBikeMission.id,
              userId: auth.user.id,
              progress: 1,
              completedAt: new Date(),
            },
          });
        }
      }

      return {
        ownedBike,
        remainingBalance: wallet.balance.minus(product.price),
      };
    });

    return NextResponse.json({
      success: true,
      message: "Bike acquired successfully.",
      bike: {
        id: result.ownedBike.id,
        status: result.ownedBike.status,
        purchasePrice: result.ownedBike.purchasePrice.toString(),
        acquiredAt: result.ownedBike.acquiredAt,
        product: {
          id: result.ownedBike.product.id,
          sku: result.ownedBike.product.sku,
          name: result.ownedBike.product.name,
          imageUrl: result.ownedBike.product.imageUrl,
        },
      },
      balance: result.remainingBalance.toString(),
    });
  } catch (error) {
    console.error("Acquire bike error:", error);

    if (error instanceof Error) {
      if (error.message === "BIKE_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Bike not found.",
          },
          { status: 404 }
        );
      }

      if (error.message === "BIKE_OUT_OF_STOCK") {
        return NextResponse.json(
          {
            success: false,
            message: "This bike is out of stock.",
          },
          { status: 409 }
        );
      }

      if (error.message === "WALLET_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Wallet not found.",
          },
          { status: 400 }
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          {
            success: false,
            message: "Insufficient wallet balance.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to acquire bike.",
      },
      { status: 500 }
    );
  }
}