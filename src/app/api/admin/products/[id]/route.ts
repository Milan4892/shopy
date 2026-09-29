import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            userProducts: true,
          },
        },
        userProducts: {
          orderBy: {
            acquiredAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    const sku = String(body.sku ?? "").trim();
    const name = String(body.name ?? "").trim();
    const description = body.description
      ? String(body.description).trim()
      : null;

    const price = Number(body.price);
    const speed = Number(body.speed);
    const batteryRange = Number(body.batteryRange);
    const stock = Number(body.stock);
    const miningLimitPerDay = Number(body.miningLimitPerDay);
    const miningReward = Number(body.miningReward);
    const imageUrl = body.imageUrl
      ? String(body.imageUrl).trim()
      : null;

    const isActive = Boolean(body.isActive);

    if (
      !sku ||
      !name ||
      !Number.isFinite(price) ||
      !Number.isFinite(speed) ||
      !Number.isFinite(batteryRange) ||
      !Number.isFinite(stock) ||
      !Number.isFinite(miningLimitPerDay) ||
      !Number.isFinite(miningReward)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKU, name, price, speed, battery range, stock, mining reward, and mining limit are required.",
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

    const duplicateSku = await prisma.product.findFirst({
      where: {
        sku,
        NOT: {
          id,
        },
      },
    });

    if (duplicateSku) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with this SKU already exists.",
        },
        { status: 409 }
      );
    }

    const product = await prisma.product.update({
  where: {
    id,
  },
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
  include: {
    _count: {
      select: {
        userProducts: true,
      },
    },
    userProducts: {
      orderBy: {
        acquiredAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  },
});

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product.",
      },
      { status: 500 }
    );
  }
}