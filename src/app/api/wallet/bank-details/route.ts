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

    const account = await prisma.bankAccount.findFirst({
      where: {
        userId: auth.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("Bank details load error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load bank details.",
      },
      { status: 500 }
    );
  }
}

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

    const bankCode = String(body.bankCode || "").trim();
    const bankName = String(body.bankName || "").trim();
    const accountNumber = String(body.accountNumber || "").trim();
    const accountName = String(body.accountName || "").trim();

    if (
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All bank details are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Account number must contain exactly 10 digits.",
        },
        { status: 400 }
      );
    }

    const account = await prisma.bankAccount.upsert({
      where: {
        userId_accountNumber: {
          userId: auth.user.id,
          accountNumber,
        },
      },
      update: {
        bankName,
        accountName,
        isVerified: false,
      },
      create: {
        userId: auth.user.id,
        bankName,
        accountNumber,
        accountName,
        isVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank details saved successfully.",
      account,
    });
  } catch (error) {
    console.error("Bank details save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save bank details.",
      },
      { status: 500 }
    );
  }
}