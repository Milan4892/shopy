import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import crypto from "crypto";

function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("shoppy_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const tokenHash = hashSessionToken(sessionToken);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (
    !session ||
    session.status !== "ACTIVE" ||
    session.expiresAt <= new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    redirect("/admin/login");
  }

  const isAdmin = session.user.roles.some(
    (userRole) => userRole.role.code === "ADMIN"
  );

  if (!isAdmin) {
    redirect("/admin/login");
  }

  const [
    totalUsers,
    activeUsers,
    totalProducts,
    totalPurchases,
    pendingWithdrawals,
    totalMiningRecords,
    walletSummary,
    depositSummary,
    recentUsers,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        roles: {
          none: {
            role: {
              code: "ADMIN",
            },
          },
        },
      },
    }),

    prisma.user.count({
      where: {
        status: "ACTIVE",
        roles: {
          none: {
            role: {
              code: "ADMIN",
            },
          },
        },
      },
    }),

    prisma.product.count(),

    prisma.userProduct.count(),

    prisma.withdrawal.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.miningRecord.count(),

    prisma.wallet.aggregate({
      _sum: {
        balance: true,
      },
    }),

    prisma.walletTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "SUCCESS",
        type: "DEPOSIT",
      },
    }),

    prisma.user.findMany({
      where: {
        roles: {
          none: {
            role: {
              code: "ADMIN",
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),

    prisma.walletTransaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        reference: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const totalWalletBalance = Number(walletSummary._sum.balance ?? 0);
  const totalDeposits = Number(depositSummary._sum.amount ?? 0);

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome back, {session.user.firstName}.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-black">{totalUsers}</p>
          <p className="mt-1 text-xs text-gray-400">
            {activeUsers} active users
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total E-Bikes</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {totalProducts}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Available products
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {totalPurchases}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Bikes acquired
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Withdrawals</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {pendingWithdrawals}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Require attention
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="mt-2 text-2xl font-bold text-black">
            ₦{totalWalletBalance.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Successful Deposits</p>
          <p className="mt-2 text-2xl font-bold text-black">
            ₦{totalDeposits.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Mining Records</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {totalMiningRecords.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold text-black">Recent Users</h2>
              <p className="mt-1 text-xs text-gray-400">
                Latest customer registrations
              </p>
            </div>

            <a
              href="/admin/users"
              className="text-sm font-medium text-lime-600 hover:text-lime-700"
            >
              View all
            </a>
          </div>

          <div className="divide-y divide-gray-100">
            {recentUsers.length === 0 ? (
              <div className="p-5 text-sm text-gray-500">
                No customers found.
              </div>
            ) : (
              recentUsers.map((user) => (
                <a
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-black">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-lime-100 text-lime-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.status}
                    </span>
                    <p className="mt-2 text-xs text-gray-400">
                      {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="font-semibold text-black">
                Recent Transactions
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Latest wallet activity
              </p>
            </div>

            <a
              href="/admin/transactions"
              className="text-sm font-medium text-lime-600 hover:text-lime-700"
            >
              View all
            </a>
          </div>

          <div className="divide-y divide-gray-100">
            {recentTransactions.length === 0 ? (
              <div className="p-5 text-sm text-gray-500">
                No transactions found.
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-black">
                      {transaction.user.firstName}{" "}
                      {transaction.user.lastName}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {transaction.type} · {transaction.reference}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-black">
                      {transaction.currency}{" "}
                      {Number(transaction.amount).toLocaleString()}
                    </p>

                    <span
                      className={`text-xs font-medium ${
                        transaction.status === "SUCCESS"
                          ? "text-lime-600"
                          : transaction.status === "FAILED"
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}