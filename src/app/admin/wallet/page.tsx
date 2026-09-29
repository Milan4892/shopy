"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Wallet = {
  id: string;
  balance: string | number;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
  };
};

export default function AdminWalletPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadWallets() {
      try {
        const response = await fetch("/api/admin/wallet");
        const data = await response.json();

        if (data.success) {
          setWallets(data.wallets);
        }
      } catch (error) {
        console.error("Failed to load wallets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWallets();
  }, []);

  const filteredWallets = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return wallets;
    }

    return wallets.filter((wallet) => {
      const name =
        `${wallet.user.firstName ?? ""} ${wallet.user.lastName ?? ""}`.toLowerCase();

      return (
        name.includes(value) ||
        wallet.user.email.toLowerCase().includes(value)
      );
    });
  }, [wallets, search]);

  const totalBalance = wallets.reduce(
    (total, wallet) => total + Number(wallet.balance),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Wallet</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor customer wallet balances and account activity.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Wallets</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {wallets.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Wallet Balance</p>
          <p className="mt-2 text-2xl font-bold text-black">
            ₦{totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-black">Customer Wallets</h2>
            <p className="mt-1 text-sm text-gray-400">
              View customer wallet balances.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-lime-400 sm:w-72"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading wallets...
          </div>
        ) : filteredWallets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">No wallets found.</p>
            <p className="mt-1 text-sm text-gray-500">
              Customer wallets will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Balance</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredWallets.map((wallet) => {
                  const fullName =
                    `${wallet.user.firstName ?? ""} ${wallet.user.lastName ?? ""}`.trim();

                  return (
                    <tr
                      key={wallet.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {fullName || "Unnamed Customer"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {wallet.user.email}
                      </td>

                      <td className="px-5 py-4 font-semibold text-black">
                        ₦{Number(wallet.balance).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            wallet.user.status === "ACTIVE"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {wallet.user.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${wallet.user.id}`}
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