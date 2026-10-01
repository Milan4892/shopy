import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !hasAnyAdminRole(auth.roles, ADMIN_ROLES)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const mission = await prisma.mission.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            completions: true,
          },
        },
      },
    });

    if (!mission) {
      return NextResponse.json(
        {
          success: false,
          message: "Mission not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mission,
    });
  } catch (error) {
    console.error("GET /api/admin/missions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch mission.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !hasAnyAdminRole(auth.roles, ADMIN_ROLES)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access denied.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
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
    const isActive = Boolean(body.isActive);

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

    const mission = await prisma.mission.update({
      where: {
        id,
      },
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

    return NextResponse.json({
      success: true,
      mission,
    });
  } catch (error) {
    console.error("PATCH /api/admin/missions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update mission.",
      },
      { status: 500 }
    );
  }
}