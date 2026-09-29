"use client";

import { useState } from "react";

type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
};

export default function BankDetailsEditor({
  userId,
  account,
}: {
  userId: string;
  account: BankAccount | null;
}) {
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    account?.accountNumber ?? ""
  );
  const [accountName, setAccountName] = useState(account?.accountName ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/bank`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update bank details");
        return;
      }

      setMessage("Bank details updated successfully.");
    } catch {
      setError("Unable to update bank details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div>
        <label className="text-xs font-medium text-gray-500">
          Bank Name
        </label>

        <input
          value={bankName}
          onChange={(event) => setBankName(event.target.value)}
          placeholder="Enter bank name"
          className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">
          Account Number
        </label>

        <input
          value={accountNumber}
          onChange={(event) =>
            setAccountNumber(
              event.target.value.replace(/\D/g, "").slice(0, 10)
            )
          }
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10-digit account number"
          className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500">
          Account Name
        </label>

        <input
          value={accountName}
          onChange={(event) => setAccountName(event.target.value)}
          placeholder="Enter account name"
          className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-black outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
        />
      </div>

      {message && (
        <div className="rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="h-11 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Bank Details"}
      </button>
    </form>
  );
}