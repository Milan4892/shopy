import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";
import { generateSupportResponse } from "@/lib/support-ai";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const messages: IncomingMessage[] = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (item: unknown): item is IncomingMessage =>
              typeof item === "object" &&
              item !== null &&
              "role" in item &&
              "content" in item &&
              (item.role === "user" ||
                item.role === "assistant") &&
              typeof item.content === "string"
          )
         .map((item: IncomingMessage) => ({
            role: item.role,
            content: item.content.trim(),
          }))
         .filter((item: IncomingMessage) => item.content.length > 0)
          .slice(-20)
      : [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "At least one message is required" },
        { status: 400 }
      );
    }

    const latestMessage = messages[messages.length - 1];

    if (latestMessage.content.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long" },
        { status: 400 }
      );
    }

    const userId = auth.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
        wallet: {
          select: {
            balance: true,
            updatedAt: true,
          },
        },
        ownedProducts: {
          select: {
            id: true,
            purchasePrice: true,
            status: true,
            acquiredAt: true,
            product: {
              select: {
                name: true,
                sku: true,
                price: true,
                speed: true,
                batteryRange: true,
                miningLimitPerDay: true,
                miningReward: true,
              },
            },
          },
        },
        walletTransactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          select: {
            reference: true,
            type: true,
            status: true,
            amount: true,
            currency: true,
            description: true,
            createdAt: true,
          },
        },
        withdrawals: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          select: {
            reference: true,
            amount: true,
            fee: true,
            payoutAmount: true,
            status: true,
            note: true,
            processedAt: true,
            createdAt: true,
          },
        },
        miningRecords: {
          orderBy: {
            minedAt: "desc",
          },
          take: 50,
          select: {
            amount: true,
            minedAt: true,
            dateKey: true,
            userProduct: {
              select: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
        missionCompletions: {
          select: {
            progress: true,
            completedAt: true,
            mission: {
              select: {
                title: true,
                description: true,
                reward: true,
                target: true,
                isActive: true,
              },
            },
          },
        },
        referralsMade: {
          select: {
            referredUserId: true,
            createdAt: true,
          },
        },
        luckyDraws: {
          orderBy: {
            spunAt: "desc",
          },
          take: 20,
          select: {
            rewardType: true,
            rewardValue: true,
            spunAt: true,
          },
        },
        notifications: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
          select: {
            title: true,
            message: true,
            type: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    const accountData = {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        emailVerified: Boolean(user.emailVerifiedAt),
        phoneVerified: Boolean(user.phoneVerifiedAt),
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      wallet: user.wallet
        ? {
            balance: user.wallet.balance.toString(),
            updatedAt: user.wallet.updatedAt,
          }
        : null,
      bikes: user.ownedProducts.map((item) => ({
        id: item.id,
        name: item.product.name,
        sku: item.product.sku,
        purchasePrice: item.purchasePrice.toString(),
        status: item.status,
        acquiredAt: item.acquiredAt,
        speed: item.product.speed,
        batteryRange: item.product.batteryRange,
        miningLimitPerDay: item.product.miningLimitPerDay,
        miningReward: item.product.miningReward.toString(),
      })),
      walletTransactions: user.walletTransactions.map(
        (transaction) => ({
          reference: transaction.reference,
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount.toString(),
          currency: transaction.currency,
          description: transaction.description,
          createdAt: transaction.createdAt,
        })
      ),
      withdrawals: user.withdrawals.map((withdrawal) => ({
        reference: withdrawal.reference,
        amount: withdrawal.amount.toString(),
        fee: withdrawal.fee.toString(),
        payoutAmount: withdrawal.payoutAmount.toString(),
        status: withdrawal.status,
        note: withdrawal.note,
        processedAt: withdrawal.processedAt,
        createdAt: withdrawal.createdAt,
      })),
      mining: user.miningRecords.map((record) => ({
        amount: record.amount.toString(),
        minedAt: record.minedAt,
        dateKey: record.dateKey,
        bike: record.userProduct.product.name,
        sku: record.userProduct.product.sku,
      })),
      missions: user.missionCompletions.map((completion) => ({
        title: completion.mission.title,
        description: completion.mission.description,
        reward: completion.mission.reward.toString(),
        progress: completion.progress,
        target: completion.mission.target,
        completedAt: completion.completedAt,
        isActive: completion.mission.isActive,
      })),
      referrals: {
        total: user.referralsMade.length,
        recent: user.referralsMade.map((referral) => ({
          createdAt: referral.createdAt,
        })),
      },
      luckyDraws: user.luckyDraws.map((draw) => ({
        rewardType: draw.rewardType,
        rewardValue: draw.rewardValue?.toString() ?? null,
        spunAt: draw.spunAt,
      })),
      notifications: user.notifications.map((notification) => ({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      })),
    };

    const answer = await generateSupportResponse({
      messages,
      accountData,
    });

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Support chat error:", error);

    return NextResponse.json(
      { error: "Unable to process support request" },
      { status: 500 }
    );
  }
}