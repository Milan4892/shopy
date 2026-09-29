"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Withdrawal = {
  id: string;
  amount: number | string;
  fee: number | string;
  payoutAmount: number | string;
  status: string;
  reference: string;
  createdAt: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWithdrawals() {
      try {
        const response = await fetch("/api/wallet/withdrawals", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load withdrawal history.");
          return;
        }

        setWithdrawals(data.withdrawals || []);
      } catch {
        setError("Unable to load withdrawal history.");
      } finally {
        setLoading(false);
      }
    }

    loadWithdrawals();
  }, []);

  function getStatusClass(status: string) {
    switch (status) {
      case "COMPLETED":
  return "bg-green-50 text-green-700";
      case "REJECTED":
        return "bg-red-50 text-red-700";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/wallet"
          className="text-sm font-semibold text-gray-500 hover:text-black"
        >
          ← Back to Wallet
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-black">Withdrawal History</h1>

          <p className="mt-2 text-gray-500">
            View your withdrawal requests and their current status.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg shadow-black/5">
            <p className="text-gray-500">Loading withdrawal history...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && withdrawals.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-lg shadow-black/5">
            <p className="text-lg font-bold">No withdrawals yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Your withdrawal requests will appear here.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-black">
                    ₦{Number(withdrawal.amount).toLocaleString()}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(withdrawal.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                    withdrawal.status
                  )}`}
                >
                  {withdrawal.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Withdrawal
                  </p>
                  <p className="mt-1 font-bold">
                    ₦{Number(withdrawal.amount).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Fee
                  </p>
                  <p className="mt-1 font-bold">
                    ₦{Number(withdrawal.fee).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    You Receive
                  </p>
                  <p className="mt-1 font-bold text-green-600">
                    ₦{Number(withdrawal.payoutAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-bold">
                  {withdrawal.bankAccount.bankName}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {withdrawal.bankAccount.accountNumber}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {withdrawal.bankAccount.accountName}
                </p>
              </div>

              <p className="mt-4 break-all text-xs text-gray-400">
                Reference: {withdrawal.reference}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}