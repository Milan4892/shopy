import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const missions = await prisma.mission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      missions,
    });
  } catch (error) {
    console.error("GET /api/admin/missions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch missions.",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.roles.includes("ADMIN")) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const reward = Number(body.reward);
    const target = Number(body.target);

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Mission title is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(reward) || reward < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Reward must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(target) || target < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Target must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description: description || null,
        reward,
        target,
        isActive,
      },
      include: {
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        mission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/missions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create mission.",
      },
      { status: 500 }
    );
  }
}