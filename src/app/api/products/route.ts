import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
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
    } = body;

    if (
      !sku ||
      !name ||
      price === undefined ||
      speed === undefined ||
      batteryRange === undefined ||
      miningReward === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "sku, name, price, speed, batteryRange, and miningReward are required",
        },
        { status: 400 },
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
          message: "A product with this SKU already exists",
        },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description: description ?? null,
        price,
        speed: Number(speed),
        batteryRange: Number(batteryRange),
        stock: stock === undefined ? 0 : Number(stock),
        imageUrl: imageUrl ?? null,
        isActive: isActive === undefined ? true : Boolean(isActive),
        miningLimitPerDay:
          miningLimitPerDay === undefined ? 2 : Number(miningLimitPerDay),
        miningReward,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
      },
      { status: 500 },
    );
  }
}