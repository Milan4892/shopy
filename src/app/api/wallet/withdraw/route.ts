import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";

async function getVipLevel(userId: string) {
  const bikes = await prisma.userProduct.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    select: {
      product: {
        select: {
          sku: true,
        },
      },
    },
  });

  const counts: Record<string, number> = {
    "SHOPY-EBIKE-S4": 0,
    "SHOPY-EBIKE-S5": 0,
    "SHOPY-EBIKE-S6": 0,
    "SHOPY-EBIKE-S9": 0,
  };

  for (const bike of bikes) {
    if (bike.product.sku in counts) {
      counts[bike.product.sku]++;
    }
  }

  if (counts["SHOPY-EBIKE-S9"] >= 2) return 4;
  if (counts["SHOPY-EBIKE-S6"] >= 2) return 3;
  if (counts["SHOPY-EBIKE-S5"] >= 2) return 2;
  if (counts["SHOPY-EBIKE-S4"] >= 3) return 1;

  return 0;
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount < 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum withdrawal amount is ₦5,000.",
        },
        { status: 400 }
      );
    }

    const today = new Date();

    if (today.getDay() !== 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Withdrawals are only available on Fridays.",
        },
        { status: 400 }
      );
    }

    const vipLevel = await getVipLevel(auth.user.id);
    const feeRate = vipLevel > 0 ? 0 : 0.1;
    const fee = amount * feeRate;
    const payoutAmount = amount - fee;

const result = await prisma.$transaction(async (tx) => {
  const bankAccount = await tx.bankAccount.findFirst({
    where: {
      userId: auth.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bankAccount) {
    throw new Error("NO_BANK_ACCOUNT");
  }

  const wallet = await tx.wallet.findUnique({
    where: {
      userId: auth.user.id,
    },
  });

  if (!wallet) {
    throw new Error("NO_WALLET");
  }

  const balance = Number(wallet.balance);

  if (amount > balance) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  const pendingWithdrawal = await tx.withdrawal.findFirst({
    where: {
      userId: auth.user.id,
      status: "PENDING",
    },
  });

  if (pendingWithdrawal) {
    throw new Error("PENDING_WITHDRAWAL");
  }

  const reference = `WD-${Date.now()}-${Math.floor(
    Math.random() * 10000
  )}`;

  const withdrawal = await tx.withdrawal.create({
    data: {
      userId: auth.user.id,
      walletId: wallet.id,
      bankAccountId: bankAccount.id,
      amount,
      fee,
      payoutAmount,
      status: "PENDING",
      reference,
    },
  });

  await tx.notification.create({
    data: {
      userId: auth.user.id,
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal request of ₦${amount.toLocaleString()} has been submitted and is awaiting processing.`,
      type: "WITHDRAWAL",
    },
  });

  await tx.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  await tx.walletTransaction.create({
    data: {
      userId: auth.user.id,
      walletId: wallet.id,
      reference,
      gateway: "INTERNAL",
      type: "WITHDRAWAL",
      status: "PENDING",
      amount,
      currency: "NGN",
      description: `Withdrawal request to ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
    },
  });

  return withdrawal;
});

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal: {
        id: result.id,
        reference: result.reference,
        amount: result.amount.toString(),
        fee: result.fee.toString(),
        payoutAmount: result.payoutAmount.toString(),
        status: result.status,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NO_BANK_ACCOUNT") {
        return NextResponse.json(
          {
            success: false,
            message: "Please add your bank details before withdrawing.",
          },
          { status: 400 }
        );
      }

      if (error.message === "NO_WALLET") {
        return NextResponse.json(
          { success: false, message: "Wallet not found." },
          { status: 404 }
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          { success: false, message: "Insufficient wallet balance." },
          { status: 400 }
        );
      }

      if (error.message === "PENDING_WITHDRAWAL") {
        return NextResponse.json(
          {
            success: false,
            message: "You already have a pending withdrawal.",
          },
          { status: 400 }
        );
      }
    }

    console.error("Withdrawal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process withdrawal request.",
      },
      { status: 500 }
    );
  }
}