import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !hasAnyAdminRole(auth.roles, ADMIN_ROLES)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const bankName =
      typeof body.bankName === "string" ? body.bankName.trim() : "";
    const accountNumber =
      typeof body.accountNumber === "string"
        ? body.accountNumber.trim()
        : "";
    const accountName =
      typeof body.accountName === "string"
        ? body.accountName.trim()
        : "";

    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "Bank name, account number and account name are required" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { error: "Account number must contain exactly 10 digits" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        roles: {
          none: {
            role: {
              code: "ADMIN",
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const existingAccount = await prisma.bankAccount.findFirst({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let bankAccount;

    if (existingAccount) {
      bankAccount = await prisma.bankAccount.update({
        where: {
          id: existingAccount.id,
        },
        data: {
          bankName,
          accountNumber,
          accountName,
          isVerified: false,
        },
      });
    } else {
      bankAccount = await prisma.bankAccount.create({
        data: {
          userId: id,
          bankName,
          accountNumber,
          accountName,
          isVerified: false,
        },
      });
    }

    return NextResponse.json({
      message: "Bank details updated successfully",
      bankAccount,
    });
  } catch (error) {
    console.error("Admin bank update error:", error);

    return NextResponse.json(
      { error: "Failed to update bank details" },
      { status: 500 }
    );
  }
}