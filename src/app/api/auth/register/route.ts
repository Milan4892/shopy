import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { RoleCode } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function generateReferralCode() {
  return `SHY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      referralCode,
    } = body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "First name, last name, email, phone number and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const cleanReferralCode =
      typeof referralCode === "string" && referralCode.trim()
        ? referralCode.trim().toUpperCase()
        : null;

    if (
      cleanFirstName.length < 2 ||
      cleanLastName.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "First name and last name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (!cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (!cleanEmail.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: cleanPhone,
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    let referrer = null;

    if (cleanReferralCode) {
      referrer = await prisma.user.findUnique({
        where: {
          referralCode: cleanReferralCode,
        },
      });

      if (!referrer) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid referral code.",
          },
          { status: 400 }
        );
      }
    }

    const customerRole = await prisma.role.findUnique({
      where: {
        code: RoleCode.CUSTOMER,
      },
    });

    if (!customerRole) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer role is not configured.",
        },
        { status: 500 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      let newReferralCode = generateReferralCode();

      while (
        await tx.user.findUnique({
          where: {
            referralCode: newReferralCode,
          },
        })
      ) {
        newReferralCode = generateReferralCode();
      }

      const newUser = await tx.user.create({
        data: {
          firstName: cleanFirstName,
          lastName: cleanLastName,
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          referralCode: newReferralCode,
          referredById: referrer?.id ?? null,
        },
      });

      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: customerRole.id,
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
        },
      });

      if (referrer) {
        await tx.referral.create({
          data: {
            referrerId: referrer.id,
            referredUserId: newUser.id,
          },
        });

        const referralCount = await tx.referral.count({
          where: {
            referrerId: referrer.id,
          },
        });

        if (referralCount === 3) {
          const referralMission = await tx.mission.findFirst({
            where: {
              title: "Refer 3 New Users",
              isActive: true,
            },
          });

          if (referralMission) {
            const existingCompletion =
              await tx.missionCompletion.findUnique({
                where: {
                  missionId_userId: {
                    missionId: referralMission.id,
                    userId: referrer.id,
                  },
                },
              });

            if (!existingCompletion) {
              const s3 = await tx.product.findUnique({
                where: {
                  sku: "SHOPY-EBIKE-S3",
                },
              });

              if (s3 && s3.stock > 0) {
                await tx.product.update({
                  where: {
                    id: s3.id,
                  },
                  data: {
                    stock: {
                      decrement: 1,
                    },
                  },
                });

                await tx.userProduct.create({
                  data: {
                    userId: referrer.id,
                    productId: s3.id,
                    purchasePrice: 0,
                    status: "ACTIVE",
                  },
                });

                await tx.missionCompletion.create({
                  data: {
                    missionId: referralMission.id,
                    userId: referrer.id,
                    progress: 3,
                    completedAt: new Date(),
                  },
                });
              }
            }
          }
        }
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          referralCode: user.referralCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create account.",
      },
      { status: 500 }
    );
  }
}