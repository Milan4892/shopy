import crypto from "crypto";
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

      const updatedProduct = await tx.product.updateMany({
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

      if (updatedProduct.count !== 1) {
        throw new Error("BIKE_OUT_OF_STOCK");
      }

      const updatedWallet = await tx.wallet.updateMany({
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

      if (updatedWallet.count !== 1) {
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

      const reference = `SHOPY-BUY-${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}`;

      await tx.walletTransaction.create({
        data: {
          userId: auth.user.id,
          walletId: wallet.id,
          reference,
          gateway: "SHOPY",
          type: "BIKE_PURCHASE",
          status: "SUCCESS",
          amount: product.price,
          currency: "NGN",
          description: `Purchase of ${product.name}`,
        },
      });

      const finalWallet = await tx.wallet.findUnique({
        where: {
          id: wallet.id,
        },
      });

      return {
        bike: ownedBike,
        balance: finalWallet?.balance.toString() || "0",
        reference,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Bike acquired successfully.",
      bike: {
        id: result.bike.id,
        status: result.bike.status,
        purchasePrice: result.bike.purchasePrice.toString(),
        acquiredAt: result.bike.acquiredAt,
        product: {
          id: result.bike.product.id,
          sku: result.bike.product.sku,
          name: result.bike.product.name,
          imageUrl: result.bike.product.imageUrl,
        },
      },
      transaction: {
        reference: result.reference,
        type: "BIKE_PURCHASE",
        amount: result.bike.purchasePrice.toString(),
        status: "SUCCESS",
      },
      balance: result.balance,
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