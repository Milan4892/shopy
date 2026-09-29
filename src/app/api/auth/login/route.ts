import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_DURATION_DAYS = 7;

function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Shoppy login API is working.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { phone, password } = body;

    if (typeof phone !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        phone: cleanPhone,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number or password.",
        },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "This account is not active.",
        },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number or password.",
        },
        { status: 401 }
      );
    }

    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
      },
      include: {
        role: true,
      },
    });

    if (userRoles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User role is not configured.",
        },
        { status: 500 }
      );
    }

    const roles = userRoles.map(
      (userRole) => userRole.role.code
    );

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);

    const expiresAt = new Date(
      Date.now() +
        SESSION_DURATION_DAYS *
          24 *
          60 *
          60 *
          1000
    );

    const userAgent = request.headers.get("user-agent");

    const forwardedFor = request.headers.get("x-forwarded-for");

    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          ipAddress,
          userAgent,
        },
      });

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastLoginAt: new Date(),
        },
      });
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roles,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "shoppy_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to login.",
      },
      { status: 500 }
    );
  }
}