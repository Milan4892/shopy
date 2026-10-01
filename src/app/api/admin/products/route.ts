import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";

export async function GET(request: Request) {
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

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            userProducts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const sku = String(body.sku ?? "").trim();
    const name = String(body.name ?? "").trim();
    const description = body.description
      ? String(body.description).trim()
      : null;

    const price = Number(body.price);
    const speed = Number(body.speed);
    const batteryRange = Number(body.batteryRange);
    const stock = body.stock === undefined ? 0 : Number(body.stock);
    const miningLimitPerDay =
      body.miningLimitPerDay === undefined
        ? 2
        : Number(body.miningLimitPerDay);
    const miningReward = Number(body.miningReward);
    const imageUrl = body.imageUrl
      ? String(body.imageUrl).trim()
      : null;

    const isActive =
      body.isActive === undefined ? true : Boolean(body.isActive);

    if (
      !sku ||
      !name ||
      !Number.isFinite(price) ||
      !Number.isFinite(speed) ||
      !Number.isFinite(batteryRange) ||
      !Number.isFinite(miningReward)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKU, name, price, speed, battery range, and mining reward are required.",
        },
        { status: 400 }
      );
    }

    if (
      price < 0 ||
      speed < 0 ||
      batteryRange < 0 ||
      stock < 0 ||
      miningLimitPerDay < 0 ||
      miningReward < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product values cannot be negative.",
        },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        price,
        speed,
        batteryRange,
        stock,
        imageUrl,
        isActive,
        miningLimitPerDay,
        miningReward,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product.",
      },
      { status: 500 }
    );
  }
}