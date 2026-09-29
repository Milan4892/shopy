"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  reference: string;
  type: string;
  amount: string | number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export default function AdminWalletTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await fetch(
          "/api/admin/wallet/transactions"
        );

        const data = await response.json();

        if (data.success) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const value = search.toLowerCase().trim();

    return transactions.filter((transaction) => {
      const customerName =
        `${transaction.user.firstName ?? ""} ${transaction.user.lastName ?? ""}`.toLowerCase();

      const matchesSearch =
        !value ||
        customerName.includes(value) ||
        transaction.user.email.toLowerCase().includes(value) ||
        transaction.reference.toLowerCase().includes(value);

      const matchesStatus =
        status === "ALL" || transaction.status === status;

      const matchesType =
        type === "ALL" || transaction.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, search, status, type]);

  const totalAmount = transactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
  );

  const successfulAmount = transactions
    .filter((transaction) => transaction.status === "SUCCESS")
    .reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Wallet Transactions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor customer wallet funding and transaction activity.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/wallet"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
          >
            ← Wallet
          </Link>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {transactions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Successful Amount
          </p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {formatMoney(successfulAmount)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold text-black">
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Search and filter wallet transactions.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Search customer or reference..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-lime-400"
            />

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-lime-400"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="PURCHASE">Purchase</option>
              <option value="MINING_REWARD">
                Mining Reward
              </option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-lime-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">
              No transactions found.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Matching wallet transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">
                    Customer
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Reference
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Type
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Amount
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => {
                  const fullName =
                    `${transaction.user.firstName ?? ""} ${transaction.user.lastName ?? ""}`.trim();

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {fullName || "Unnamed Customer"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {transaction.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {transaction.reference}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {transaction.type}
                      </td>

                      <td className="px-5 py-4 font-semibold text-black">
                        {formatMoney(transaction.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
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

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString("en-NG")}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${transaction.user.id}`}
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