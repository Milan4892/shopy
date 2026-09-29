import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
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

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid amount.",
        },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: auth.user.id,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "PAYSTACK_SECRET_KEY is missing from .env.",
        },
        { status: 500 }
      );
    }

    const reference = `SHOPY-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: auth.user.id,
        walletId: wallet.id,
        reference,
        gateway: "PAYSTACK",
        type: "DEPOSIT",
        status: "PENDING",
        amount,
        currency: "NGN",
        description: "Shoppy wallet funding",
      },
    });

    const callbackUrl = `${new URL(request.url).origin}/wallet`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: auth.user.email,
          amount: String(Math.round(amount * 100)),
          currency: "NGN",
          reference,
          callback_url: callbackUrl,
          metadata: JSON.stringify({
            userId: auth.user.id,
            walletId: wallet.id,
            transactionId: transaction.id,
          }),
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status || !data.data?.authorization_url) {
      await prisma.walletTransaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "FAILED",
        },
      });

      console.error("Paystack initialization failed:", {
        status: response.status,
        message: data.message,
        data: data.data,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            data.message ||
            `Paystack initialization failed with status ${response.status}.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}