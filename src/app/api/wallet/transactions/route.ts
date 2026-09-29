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

    const transactions = await prisma.walletTransaction.findMany({
      where: {
        userId: auth.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        reference: transaction.reference,
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        description: transaction.description,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    console.error("Wallet transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load transactions.",
      },
      { status: 500 }
    );
  }
}