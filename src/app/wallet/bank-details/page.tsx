"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
};

export default function BankDetailsPage() {
  const [account, setAccount] = useState<BankAccount | null>(null);
 const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch("/api/wallet/bank-details", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          setMessage(data.message || "Unable to load bank details.");
          setMessageType("error");
          return;
        }

        if (data.account) {
          setAccount(data.account);
          setBankName(data.account.bankName);
          setAccountNumber(data.account.accountNumber);
          setAccountName(data.account.accountName);
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load bank details.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  async function handleSave() {
    if (!bankName || !accountNumber || !accountName) {
      setMessage("Please complete all bank details.");
      setMessageType("error");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setMessage("Account number must contain 10 digits.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/wallet/bank-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save bank details.");
        setMessageType("error");
        return;
      }

     setAccount(data.account);
window.location.href = "/wallet/withdraw";
    } catch (error) {
      console.error(error);
      setMessage("Unable to save bank details.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading bank details...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3ea] text-[#111713]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-black">
            Shoppy
          </Link>

          <Link
            href="/wallet"
            className="rounded-xl bg-[#111713] px-4 py-2 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Wallet
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/wallet"
          className="text-sm font-semibold text-gray-500 hover:text-[#111713]"
        >
          ← Back to Wallet
        </Link>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
  <p className="font-bold text-amber-900">
    ⚠️ Important: Check Your Bank Details Carefully
  </p>

  <p className="mt-2 text-sm leading-6 text-amber-800">
    Please make sure your bank name, account number, and account name are
    correct before saving. Once your bank details are saved, you cannot
    change them yourself. If you enter incorrect information, you will need
    to contact the Shoppy support/admin team to request a correction.
  </p>

  <p className="mt-2 text-sm font-semibold text-amber-900">
    Shoppy will use the saved bank details for your withdrawals.
  </p>
</div>

        <section className="mt-6">
          <p className="text-sm font-medium text-gray-500">
            Withdrawal account
          </p>

          <h1 className="mt-1 text-4xl font-black">
            Bank Details
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Add the Nigerian bank account you want to use for withdrawals.
          </p>
        </section>

        {message && (
          <div
            className={`mt-6 rounded-2xl px-5 py-4 text-sm font-semibold ${
              messageType === "success"
                ? "bg-lime-100 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-lg shadow-black/5">
          {account && (
            <div className="mb-7 rounded-2xl bg-[#eef3ea] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Saved Account
                  </p>

                  <p className="mt-1 font-black">
                    {account.bankName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {account.accountName}
                  </p>

                  <p className="mt-1 text-sm font-semibold tracking-wider">
                    {account.accountNumber}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    account.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {"Bank details saved"}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Bank Name
              </label>

              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. OPay"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Account Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="0123456789"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Account Name
              </label>

              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account holder name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-7 w-full rounded-xl bg-[#111713] px-5 py-4 text-sm font-black text-white transition hover:bg-lime-400 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bank Details"}
          </button>
        </section>

        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-6 text-yellow-800">
          Bank details should be verified before withdrawals are enabled.
          We will connect account verification to the withdrawal process next.
        </div>
      </div>
    </main>
  );
}