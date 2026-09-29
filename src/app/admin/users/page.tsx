import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatMoney(value: unknown) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
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
    include: {
      wallet: true,
      ownedProducts: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and view Shopy customer accounts.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Customers</p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {users.filter((user) => user.status === "ACTIVE").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {users.filter((user) => user.status === "SUSPENDED").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Deactivated</p>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {users.filter((user) => user.status === "DEACTIVATED").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-5">
          <h2 className="font-semibold text-black">Customer Accounts</h2>
          <p className="mt-1 text-sm text-gray-400">
            All registered customers excluding administrators.
          </p>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">No customers found.</p>
            <p className="mt-1 text-sm text-gray-500">
              Registered customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Wallet</th>
                  <th className="px-5 py-4 font-medium">E-Bikes</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const fullName =
                    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {fullName || "Unnamed Customer"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>

                      <td className="px-5 py-4 font-semibold text-black">
                        {formatMoney(user.wallet?.balance ?? 0)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {user.ownedProducts.length}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.status === "ACTIVE"
                              ? "bg-lime-100 text-lime-700"
                              : user.status === "SUSPENDED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-NG")}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
                        >
                          View User
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}