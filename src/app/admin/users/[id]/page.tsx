import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BankDetailsEditor from "./BankDetailsEditor";

function formatMoney(value: unknown) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default async function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: {
      id,
      roles: {
        none: {
          role: {
            code: "ADMIN",
          },
        },
      },
    },
    include: {
      wallet: true,
      ownedProducts: {
        include: {
          product: true,
        },
        orderBy: {
          acquiredAt: "desc",
        },
      },
      walletTransactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      miningRecords: {
        orderBy: {
          minedAt: "desc",
        },
        take: 10,
      },
      bankAccounts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      withdrawals: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      referredUsers: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
         <Link
  href="/admin"
  className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
>
  ← Dashboard
</Link>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-black">
            {user.firstName} {user.lastName}
          </h1>

          <section className="rounded-2xl border border-gray-200 bg-white">
  <div className="border-b border-gray-200 px-6 py-5">
    <h2 className="font-bold text-black">
      Customer Bank Details
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Update the bank account used by this customer for withdrawals.
    </p>
  </div>

  <BankDetailsEditor
    userId={user.id}
    account={user.bankAccounts[0] ?? null}
  />
</section>

        <span
          className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${
            user.status === "ACTIVE"
              ? "bg-lime-100 text-lime-700"
              : user.status === "SUSPENDED"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {user.status}
        </span>
      </div>
</div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(user.wallet?.balance ?? 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Owned E-Bikes</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {user.ownedProducts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Mining Records</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {user.miningRecords.length}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Full Name</p>
            <p className="mt-1 font-medium text-black">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="mt-1 break-all font-medium text-black">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="mt-1 font-medium text-black">
              {user.phone}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Referral Code</p>
            <p className="mt-1 font-medium text-black">
              {user.referralCode || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email Verification</p>
            <p className="mt-1 font-medium text-black">
              {user.emailVerifiedAt ? "Verified" : "Not verified"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Joined</p>
            <p className="mt-1 font-medium text-black">
              {new Date(user.createdAt).toLocaleString("en-NG")}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Last Login</p>
            <p className="mt-1 font-medium text-black">
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString("en-NG")
                : "Never"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Owned E-Bikes
          </h2>
        </div>

        <div className="overflow-x-auto">
          {user.ownedProducts.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">
              This customer does not own any e-bikes.
            </p>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Bike
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Purchase Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Acquired
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {user.ownedProducts.map((ownedProduct) => (
                  <tr key={ownedProduct.id}>
                    <td className="px-6 py-4 font-semibold text-black">
                      {ownedProduct.product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ownedProduct.product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatMoney(ownedProduct.purchasePrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
                        {ownedProduct.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        ownedProduct.acquiredAt
                      ).toLocaleDateString("en-NG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Wallet Transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          {user.walletTransactions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">
              No wallet transactions found.
            </p>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Date
                  </th>
                         <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
    Action
  </th>
                </tr>
              </thead>
      
              <tbody className="divide-y divide-gray-100">
                {user.walletTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                   <td className="px-6 py-4">
  <Link
    href={`/admin/users/${user.id}/transactions/${transaction.id}`}
    className="text-sm font-medium text-black transition hover:text-lime-600"
  >
    {transaction.reference}
  </Link>
</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-black">
                      {formatMoney(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.status === "SUCCESS"
                            ? "bg-lime-100 text-lime-700"
                            : transaction.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        transaction.createdAt
                      ).toLocaleString("en-NG")}
                    </td>
                    <td className="px-6 py-4">
  <Link
    href={`/admin/users/${user.id}/transactions/${transaction.id}`}
    className="inline-flex h-9 items-center rounded-lg bg-black px-3 text-sm font-medium text-white transition hover:bg-gray-800"
  >
    View
  </Link>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="font-bold text-black">
              Mining Activity
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {user.miningRecords.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500">
                No mining activity found.
              </p>
            ) : (
              user.miningRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Mining reward
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {record.dateKey}
                    </p>
                  </div>

                  <p className="font-semibold text-lime-600">
                    +{formatMoney(record.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="font-bold text-black">
              Bank Accounts
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {user.bankAccounts.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500">
                No bank account added.
              </p>
            ) : (
              user.bankAccounts.map((account) => (
                <div key={account.id} className="px-6 py-4">
                  <p className="font-semibold text-black">
                    {account.bankName}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {account.accountNumber}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {account.accountName}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-bold text-black">
            Referrals
          </h2>
        </div>

        <div className="p-6">
          {user.referredUsers.length === 0 ? (
            <p className="text-sm text-gray-500">
              This customer has not referred any users.
            </p>
          ) : (
            <div className="space-y-3">
              {user.referredUsers.map((referredUser) => (
                <div
                  key={referredUser.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-black">
                      {referredUser.firstName}{" "}
                      {referredUser.lastName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {referredUser.email}
                    </p>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(
                      referredUser.createdAt
                    ).toLocaleDateString("en-NG")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="font-bold text-black">
          Account Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          User status controls will be connected to the admin API next.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-white opacity-50"
          >
            Suspend User
          </button>

          <button
            type="button"
            disabled
            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white opacity-50"
          >
            Deactivate User
          </button>

          <button
            type="button"
            disabled
            className="rounded-xl bg-lime-500 px-4 py-3 text-sm font-semibold text-black opacity-50"
          >
            Reactivate User
          </button>
        </div>
      </section>
    </div>
  );
}