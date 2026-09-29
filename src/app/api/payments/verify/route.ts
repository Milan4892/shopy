import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
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

    const { searchParams } = new URL(request.url);
    const reference =
      searchParams.get("reference") ||
      searchParams.get("trxref");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    const transaction = await prisma.walletTransaction.findUnique({
      where: {
        reference,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found.",
        },
        { status: 404 }
      );
    }

    if (transaction.userId !== auth.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to verify this transaction.",
        },
        { status: 403 }
      );
    }

    if (transaction.type !== "DEPOSIT") {
      return NextResponse.json(
        {
          success: false,
          message: "This transaction cannot fund the wallet.",
        },
        { status: 400 }
      );
    }

    if (transaction.status === "SUCCESS") {
      const wallet = await prisma.wallet.findUnique({
        where: {
          id: transaction.walletId,
        },
      });

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        message: "Payment has already been processed.",
        transaction: {
          reference: transaction.reference,
          amount: transaction.amount.toString(),
          status: transaction.status,
        },
        balance: wallet?.balance.toString() || "0",
      });
    }

    if (
      transaction.status !== "PENDING" &&
      transaction.status !== "PROCESSING"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `This payment is already ${transaction.status.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway is not configured.",
        },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            paystackData.message ||
            "Unable to verify payment with Paystack.",
        },
        { status: 502 }
      );
    }

    const payment = paystackData.data;

    const expectedAmountKobo = Math.round(
      Number(transaction.amount) * 100
    );

    if (
      payment.status !== "success" ||
      payment.currency !== transaction.currency ||
      Number(payment.amount) !== expectedAmountKobo ||
      payment.reference !== transaction.reference
    ) {
      await prisma.walletTransaction.updateMany({
        where: {
          id: transaction.id,
          status: "PENDING",
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
          userId: auth.user.id,
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

        const wallet = await tx.wallet.findUnique({
          where: {
            id: transaction.walletId,
          },
        });

        return {
          alreadyProcessed:
            existingTransaction?.status === "SUCCESS" ||
            existingTransaction?.status === "PROCESSING",
          balance: wallet?.balance.toString() || "0",
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
      transaction: {
        reference: transaction.reference,
        amount: transaction.amount.toString(),
        status: "SUCCESS",
      },
      balance: result.balance,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}