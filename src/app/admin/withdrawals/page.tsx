"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Withdrawal = {
  id: string;
  amount: unknown;
  status: string;
  createdAt: string;
  processedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  bankAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
};

function formatMoney(value: unknown) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getStatusClass(status: string) {
  if (status === "COMPLETED") {
    return "bg-lime-100 text-lime-700";
  }

  if (status === "PENDING" || status === "PROCESSING") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (status === "FAILED" || status === "REJECTED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadWithdrawals() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/withdrawals", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.withdrawals);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function markWithdrawalCompleted(withdrawal: Withdrawal) {
    const confirmed = window.confirm(
      `Confirm that ₦${Number(
        withdrawal.amount
      ).toLocaleString()} has been sent to ${withdrawal.bankAccount?.accountName || "this customer"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(withdrawal.id);

      const response = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          withdrawalId: withdrawal.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        window.alert(data.message || "Failed to update withdrawal.");
        return;
      }

      setWithdrawals((current) =>
        current.map((item) =>
          item.id === withdrawal.id
            ? {
                ...item,
                status: "COMPLETED",
                processedAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch {
      window.alert("Unable to update withdrawal.");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredWithdrawals = useMemo(() => {
    const query = search.toLowerCase().trim();

    return withdrawals.filter((withdrawal) => {
      const fullName =
        `${withdrawal.user.firstName ?? ""} ${withdrawal.user.lastName ?? ""}`.trim();

      const matchesSearch =
        !query ||
        fullName.toLowerCase().includes(query) ||
        withdrawal.user.email.toLowerCase().includes(query) ||
        withdrawal.bankAccount?.bankName.toLowerCase().includes(query) ||
        withdrawal.bankAccount?.accountName.toLowerCase().includes(query) ||
        withdrawal.bankAccount?.accountNumber.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || withdrawal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, search, statusFilter]);

  const totalAmount = withdrawals.reduce(
    (total, withdrawal) => total + Number(withdrawal.amount),
    0
  );

  const pendingAmount = withdrawals
    .filter(
      (withdrawal) =>
        withdrawal.status === "PENDING" ||
        withdrawal.status === "PROCESSING"
    )
    .reduce(
      (total, withdrawal) => total + Number(withdrawal.amount),
      0
    );

  const completedAmount = withdrawals
    .filter((withdrawal) => withdrawal.status === "COMPLETED")
    .reduce(
      (total, withdrawal) => total + Number(withdrawal.amount),
      0
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Withdrawals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage customer withdrawal requests.
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
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {withdrawals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Amount</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {formatMoney(pendingAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completed Amount</p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {formatMoney(completedAmount)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Withdrawal Requests
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Review customer withdrawal activity and bank details.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer or bank..."
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-lime-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading withdrawals...
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-black">
              No withdrawal requests found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Withdrawal requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Bank</th>
                  <th className="px-5 py-4 font-medium">Account Name</th>
                  <th className="px-5 py-4 font-medium">Account Number</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredWithdrawals.map((withdrawal) => {
                  const fullName =
                    `${withdrawal.user.firstName ?? ""} ${withdrawal.user.lastName ?? ""}`.trim();

                  const canComplete =
                    withdrawal.status === "PENDING" ||
                    withdrawal.status === "PROCESSING";

                  return (
                    <tr
                      key={withdrawal.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {fullName || "Unnamed Customer"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {withdrawal.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-black">
                        {formatMoney(withdrawal.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {withdrawal.bankAccount?.bankName ?? "No bank"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-black">
                        {withdrawal.bankAccount?.accountName ?? "No account"}
                      </td>

                      <td className="px-5 py-4 font-mono text-sm font-semibold text-black">
                        {withdrawal.bankAccount?.accountNumber ?? "No account"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            withdrawal.status
                          )}`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(
                          withdrawal.createdAt
                        ).toLocaleDateString("en-NG")}
                      </td>

                      <td className="px-5 py-4">
                        {canComplete ? (
                          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={false}
                              disabled={processingId === withdrawal.id}
                              onChange={() =>
                                markWithdrawalCompleted(withdrawal)
                              }
                              className="h-4 w-4 accent-lime-500"
                            />
                            {processingId === withdrawal.id
                              ? "Updating..."
                              : "Withdrawal Sent"}
                          </label>
                        ) : (
                          <span className="text-sm font-medium text-lime-700">
                            ✓ Withdrawal Sent
                          </span>
                        )}
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