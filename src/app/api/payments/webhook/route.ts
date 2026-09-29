import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is missing.");
      return NextResponse.json(
        { success: false, message: "Payment gateway is not configured." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing webhook signature." },
        { status: 401 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return NextResponse.json({
        success: true,
        message: "Event ignored.",
      });
    }

    const payment = event.data;

    if (!payment?.reference) {
      return NextResponse.json(
        { success: false, message: "Payment reference missing." },
        { status: 400 }
      );
    }

    const transaction = await prisma.walletTransaction.findUnique({
      where: {
        reference: payment.reference,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found." },
        { status: 404 }
      );
    }

    if (transaction.type !== "DEPOSIT") {
      return NextResponse.json({
        success: true,
        message: "Transaction type ignored.",
      });
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed.",
      });
    }

    if (
      transaction.status === "FAILED" ||
      transaction.status === "REJECTED"
    ) {
      return NextResponse.json({
        success: true,
        message: "Transaction is already closed.",
      });
    }

    const expectedAmountKobo = Math.round(
      Number(transaction.amount) * 100
    );

    const receivedAmountKobo = Number(payment.amount);

    if (
      payment.status !== "success" ||
      payment.currency !== transaction.currency ||
      receivedAmountKobo !== expectedAmountKobo ||
      payment.reference !== transaction.reference
    ) {
      await prisma.walletTransaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "FAILED",
          gatewayTransactionId:
            payment.id != null ? BigInt(payment.id) : null,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Payment details could not be verified.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.walletTransaction.updateMany({
        where: {
          id: transaction.id,
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
        },
      });

      if (claim.count === 0) {
        const existingTransaction =
          await tx.walletTransaction.findUnique({
            where: {
              id: transaction.id,
            },
          });

        return {
          alreadyProcessed:
            existingTransaction?.status === "SUCCESS" ||
            existingTransaction?.status === "PROCESSING",
        };
      }

      const wallet = await tx.wallet.findUnique({
        where: {
          id: transaction.walletId,
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });

      await tx.walletTransaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "SUCCESS",
          gatewayTransactionId:
            payment.id != null ? BigInt(payment.id) : null,
        },
      });

      const user = await tx.user.findUnique({
        where: {
          id: transaction.userId,
        },
        select: {
          transactionNotifications: true,
        },
      });

      if (user?.transactionNotifications) {
        await tx.notification.create({
          data: {
            userId: transaction.userId,
            title: "Wallet Funded",
            message: `Your wallet has been successfully funded with ₦${transaction.amount.toNumber().toLocaleString()}.`,
            type: "FUNDING",
          },
        });
      }

      const fundMission = await tx.mission.findFirst({
        where: {
          title: "Fund Your Wallet",
          isActive: true,
        },
      });

      if (fundMission) {
        const existingCompletion =
          await tx.missionCompletion.findUnique({
            where: {
              missionId_userId: {
                missionId: fundMission.id,
                userId: transaction.userId,
              },
            },
          });

        if (!existingCompletion) {
          await tx.missionCompletion.create({
            data: {
              missionId: fundMission.id,
              userId: transaction.userId,
              progress: 1,
              completedAt: new Date(),
            },
          });
        }
      }

      return {
        alreadyProcessed: false,
        balance: updatedWallet.balance.toString(),
      };
    });

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      message: result.alreadyProcessed
        ? "Payment has already been processed."
        : "Payment verified and wallet funded successfully.",
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}