"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Transaction = {
  id: string;
  reference: string;
  gateway: string;
  gatewayTransactionId: string | number | bigint | null;
  type: string;
  status: string;
  amount: string | number;
  currency: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  wallet: {
    id: string;
    balance: string | number;
  };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTransactions(page = 1) {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });

    if (search.trim()) params.set("search", search.trim());
    if (type) params.set("type", type);
    if (status) params.set("status", status);

    try {
      const response = await fetch(
        `/api/admin/transactions?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load transactions");
      }

      const data = await response.json();

      setTransactions(data.transactions ?? []);
      setPagination(data.pagination);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, [type, status]);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    loadTransactions(1);
  }

  function formatAmount(amount: string | number, currency: string) {
    const value = Number(amount);

    return `${currency} ${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function statusClass(value: string) {
    const normalized = value.toUpperCase();

    if (["SUCCESS", "COMPLETED", "APPROVED"].includes(normalized)) {
      return "bg-green-50 text-green-700";
    }

    if (["PENDING", "PROCESSING"].includes(normalized)) {
      return "bg-yellow-50 text-yellow-700";
    }

    if (["FAILED", "CANCELLED", "REJECTED"].includes(normalized)) {
      return "bg-red-50 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer wallet transactions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pagination.total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Current Page</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pagination.page}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pages</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pagination.totalPages}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <form
          onSubmit={handleSearch}
          className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, email or reference..."
            className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-black"
          />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All Types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="PURCHASE">Purchase</option>
            <option value="MINING">Mining</option>
            <option value="REWARD">Reward</option>
            <option value="REFERRAL">Referral</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-black"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="submit"
            className="h-11 rounded-lg bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Customer
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Reference
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${transaction.user.id}`}
                        className="group"
                      >
                        <p className="font-medium text-gray-900 group-hover:underline">
                          {transaction.user.firstName}{" "}
                          {transaction.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.user.email}
                        </p>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[220px] truncate font-mono text-sm text-gray-700">
                        {transaction.reference}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {transaction.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatAmount(
                          transaction.amount,
                          transaction.currency
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${transaction.user.id}/transactions/${transaction.id}`}
                        className="inline-flex h-9 items-center rounded-lg bg-black px-3 text-sm font-medium text-white transition hover:bg-gray-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadTransactions(pagination.page - 1)}
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages || loading
                }
                onClick={() => loadTransactions(pagination.page + 1)}
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}