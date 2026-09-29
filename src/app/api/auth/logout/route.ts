import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function hashSessionToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    // If there is no cookie, the user is already logged out.
    if (!cookieHeader) {
      const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
      });

      response.cookies.set({
        name: "shoppy_session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    // Find the shoppy_session cookie
    const sessionCookie = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith("shoppy_session=")
      );

    if (!sessionCookie) {
      const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
      });

      response.cookies.set({
        name: "shoppy_session",
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    const sessionToken = sessionCookie.substring(
      "shoppy_session=".length
    );

    if (sessionToken) {
      const tokenHash = hashSessionToken(sessionToken);

      // Revoke the current session
      await prisma.session.updateMany({
        where: {
          tokenHash,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });
    }

    // Clear cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set({
      name: "shoppy_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to logout.",
      },
      { status: 500 }
    );
  }
}