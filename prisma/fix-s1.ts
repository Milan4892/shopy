import "dotenv/config";
import { randomUUID } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const product = await prisma.product.findUnique({
    where: {
      sku: "SHOPY-EBIKE-S1",
    },
  });

  if (!product) {
    throw new Error("S1 product was not found");
  }

  if (product.id) {
    console.log("S1 already has an ID:", product.id);
    return;
  }

  const newId = randomUUID();

  await prisma.product.update({
    where: {
      sku: "SHOPY-EBIKE-S1",
    },
    data: {
      id: newId,
    },
  });

  console.log("S1 ID fixed successfully:", newId);
}

main()
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });