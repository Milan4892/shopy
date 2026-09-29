import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RoleCode } from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Shopy database...");

  // =========================
  // ROLES
  // =========================

  const roles = [
    {
      code: RoleCode.CUSTOMER,
      name: "Customer",
      description: "Standard Shoppy customer",
    },
    {
      code: RoleCode.SUPER_ADMIN,
      name: "Super Admin",
      description: "Full system access",
    },
    {
      code: RoleCode.ADMIN,
      name: "Admin",
      description: "General administrative access",
    },
    {
      code: RoleCode.FINANCE_ADMIN,
      name: "Finance Admin",
      description: "Financial operations access",
    },
    {
      code: RoleCode.CRYPTO_ADMIN,
      name: "Crypto Admin",
      description: "Cryptocurrency and blockchain operations access",
    },
    {
      code: RoleCode.SUPPORT_ADMIN,
      name: "Support Admin",
      description: "Customer support management access",
    },
    {
      code: RoleCode.CONTENT_ADMIN,
      name: "Content Admin",
      description: "Content and announcement management access",
    },
    {
      code: RoleCode.MODERATOR,
      name: "Moderator",
      description: "Moderation access",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        code: role.code,
      },
      update: {
        name: role.name,
        description: role.description,
      },
      create: role,
    });
  }

  console.log("Shoppy roles seeded successfully.");

    // =========================
  // SUPER ADMIN
  // =========================

  const adminEmail = process.env.SHOPY_ADMIN_EMAIL;
  const adminPassword = process.env.SHOPY_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SHOPY_ADMIN_EMAIL and SHOPY_ADMIN_PASSWORD are required"
    );
  }

  const superAdminRole = await prisma.role.findUnique({
    where: {
      code: RoleCode.SUPER_ADMIN,
    },
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role was not found");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  let adminUser;

  if (existingAdmin) {
    adminUser = await prisma.user.update({
      where: {
        id: existingAdmin.id,
      },
      data: {
        passwordHash,
        status: "ACTIVE",
        firstName: "Shopy",
        lastName: "Admin",
      },
    });
  } else {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: "Shopy",
        lastName: "Admin",
        phone: `ADMIN-${crypto.randomBytes(8).toString("hex")}`,
        status: "ACTIVE",
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log("SUPER_ADMIN account seeded successfully.");

  // =========================
  // PRODUCTS
  // =========================

  const products = [
    {
      sku: "SHOPY-EBIKE-S1",
      name: "Shoppy E-Bike S1",
      description: "Entry-level Shoppy electric bike",
      price: 10000,
      speed: 20,
      batteryRange: 25,
      miningReward: 500,
      miningLimitPerDay: 2,
      stock: 60,
    },
    {
      sku: "SHOPY-EBIKE-S2",
      name: "Shoppy E-Bike S2",
      description: "Standard Shoppy electric bike",
      price: 20000,
      speed: 25,
      batteryRange: 35,
      miningReward: 600,
      miningLimitPerDay: 2,
      stock: 40,
    },
    {
      sku: "SHOPY-EBIKE-S3",
      name: "Shoppy E-Bike S3",
      description: "Enhanced Shoppy electric bike",
      price: 35000,
      speed: 30,
      batteryRange: 45,
      miningReward: 800,
      miningLimitPerDay: 2,
      stock: 55,
    },
    {
      sku: "SHOPY-EBIKE-S4",
      name: "Shoppy E-Bike S4",
      description: "Performance Shoppy electric bike",
      price: 50000,
      speed: 35,
      batteryRange: 55,
      miningReward: 1000,
      miningLimitPerDay: 2,
      stock: 35,
    },
    {
      sku: "SHOPY-EBIKE-S5",
      name: "Shoppy E-Bike S5",
      description: "Premium Shoppy electric bike",
      price: 70000,
      speed: 40,
      batteryRange: 70,
      miningReward: 1300,
      miningLimitPerDay: 2,
      stock: 40,
    },
    {
      sku: "SHOPY-EBIKE-S6",
      name: "Shoppy E-Bike S6",
      description: "Advanced Shoppy electric bike",
      price: 90000,
      speed: 45,
      batteryRange: 85,
      miningReward: 1600,
      miningLimitPerDay: 2,
      stock: 30,
    },
    {
      sku: "SHOPY-EBIKE-S7",
      name: "Shoppy E-Bike S7",
      description: "High-performance Shoppy electric bike",
      price: 120000,
      speed: 50,
      batteryRange: 100,
      miningReward: 2000,
      miningLimitPerDay: 2,
      stock: 20,
    },
    {
      sku: "SHOPY-EBIKE-S8",
      name: "Shoppy E-Bike S8",
      description: "Premium performance Shoppy electric bike",
      price: 150000,
      speed: 55,
      batteryRange: 120,
      miningReward: 2500,
      miningLimitPerDay: 2,
      stock: 20,
    },
    {
      sku: "SHOPY-EBIKE-S9",
      name: "Shoppy E-Bike S9",
      description: "Ultimate Shoppy electric bike",
      price: 200000,
      speed: 60,
      batteryRange: 140,
      miningReward: 3000,
      miningLimitPerDay: 2,
      stock: 20,
    },
  ];

    // =========================
  // MISSIONS
  // =========================

  const missions = [
    {
      title: "Complete Your Profile",
      description: "Complete your Shoppy profile.",
      reward: 0,
      target: 1,
    },
    {
      title: "Acquire Your First E-Bike",
      description: "Acquire your first Shoppy e-bike.",
      reward: 0,
      target: 1,
    },
    {
      title: "Fund Your Wallet",
      description: "Fund your Shoppy wallet at least once.",
      reward: 0,
      target: 1,
    },
    {
      title: "Mine Your E-Bike",
      description: "Complete one mining session with your e-bike.",
      reward: 0,
      target: 1,
    },
    {
  title: "Refer 3 New Users",
  description: "Invite 3 new users to join Shoppy and get 1 S3 E-Bike FREE.",
  reward: 0,
  target: 3,
},
  ];
  

    // =========================
  // REFERRAL CODES
  // =========================

  const usersWithoutReferralCodes = await prisma.user.findMany({
    where: {
      referralCode: null,
    },
    select: {
      id: true,
    },
  });

  for (const user of usersWithoutReferralCodes) {
    let referralCode = "";

    while (!referralCode) {
      const candidate = `SHY-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      const existingCode = await prisma.user.findUnique({
        where: {
          referralCode: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existingCode) {
        referralCode = candidate;
      }
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        referralCode,
      },
    });
  }

  console.log("Existing users referral codes updated successfully.");
  

  for (const mission of missions) {
    const existingMission = await prisma.mission.findFirst({
      where: {
        title: mission.title,
      },
    });

    if (existingMission) {
      await prisma.mission.update({
        where: {
          id: existingMission.id,
        },
        data: mission,
      });
    } else {
      await prisma.mission.create({
        data: mission,
      });
    }
  }

  console.log("Shoppy missions seeded successfully.");

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        sku: product.sku,
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        speed: product.speed,
        batteryRange: product.batteryRange,
        miningReward: product.miningReward,
        miningLimitPerDay: product.miningLimitPerDay,
        stock: product.stock,
      },
      create: product,
    });
  }

  console.log("9 Shoppy e-bike products seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });