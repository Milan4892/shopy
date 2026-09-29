"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type WalletUser = {
  firstName: string;
  lastName: string;
  wallet: {
    balance: string;
  };
};

type Transaction = {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  description: string | null;
  createdAt: string;
};

function WalletContent() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<WalletUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");
  const [showFundForm, setShowFundForm] = useState(false);
  const verifyingReference = useRef<string | null>(null);

  async function loadWallet() {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.authenticated) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
  }

  async function loadTransactions() {
    try {
      setTransactionsLoading(true);

      const response = await fetch("/api/wallet/transactions", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Transaction loading error:", error);
    } finally {
      setTransactionsLoading(false);
    }
  }

  useEffect(() => {
    async function initializeWallet() {
      try {
        await loadWallet();
      } catch (error) {
        console.error(error);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    initializeWallet();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const reference =
      searchParams.get("reference") ??
      searchParams.get("trxref");

    if (!reference) {
      return;
    }

    const paymentReference: string = reference;

    if (verifyingReference.current === paymentReference) {
      return;
    }

    verifyingReference.current = paymentReference;

    async function verifyPayment() {
      setMessage("Verifying your payment...");
      setMessageType("info");

      try {
        const response = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(
            paymentReference
          )}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setMessage(
            data.message || "Unable to verify payment."
          );
          setMessageType("error");
          return;
        }

        setMessage(
          data.message ||
            "Payment verified and wallet funded successfully."
        );
        setMessageType("success");

        await loadWallet();
        await loadTransactions();

        window.history.replaceState({}, "", "/wallet");
      } catch (error) {
        console.error("Payment verification error:", error);

        setMessage(
          "Unable to verify payment. Please try again."
        );
        setMessageType("error");
      }
    }

    verifyPayment();
  }, [searchParams]);

  async function handleFundAccount() {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage("Please enter a valid amount.");
      setMessageType("error");
      return;
    }

    if (parsedAmount < 5000) {
      setMessage("Minimum funding amount is ₦5000.");
      setMessageType("error");
      return;
    }

    setFunding(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: parsedAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to initialize payment."
        );
        setMessageType("error");
        return;
      }

      if (!data.authorizationUrl) {
        setMessage(
          "Payment checkout could not be created."
        );
        setMessageType("error");
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Payment initialization error:", error);

      setMessage(
        "Unable to connect to the payment gateway."
      );
      setMessageType("error");
    } finally {
      setFunding(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading wallet...
        </p>
      </main>
    );
  }

  const balance = Number(user?.wallet?.balance ?? 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ea] text-[#111713]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-200/40 blur-3xl" />

      <div className="pointer-events-none absolute right-[-120px] top-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/dashboard"
            className="text-2xl font-black"
          >
            Shoppy
          </Link>

          <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <Link
              href="/dashboard"
              className="text-gray-500 transition hover:text-[#111713]"
            >
              Dashboard
            </Link>

            <Link
              href="/products"
              className="text-gray-500 transition hover:text-[#111713]"
            >
              E-Bikes
            </Link>

            <Link
              href="/my-bikes"
              className="text-gray-500 transition hover:text-[#111713]"
            >
              My Bikes
            </Link>

            <Link
              href="/mining"
              className="text-gray-500 transition hover:text-[#111713]"
            >
              Mining
            </Link>

            <Link
              href="/wallet"
              className="text-lime-600"
            >
              Wallet
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#111713] px-4 py-2 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8">
        <section>
          <p className="text-sm font-medium text-gray-500">
            Your money
          </p>

          <h1 className="mt-1 text-4xl font-black">
            Wallet
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your Shoppy wallet securely.
          </p>
        </section>

        {message && (
          <div
            className={`mt-6 rounded-2xl px-5 py-4 text-sm font-semibold ${
              messageType === "success"
                ? "bg-lime-100 text-green-700"
                : messageType === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-white text-gray-600"
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[#111713] p-7 text-white shadow-2xl shadow-black/10 sm:p-9">
          <p className="text-sm font-medium text-white/60">
            Available Balance
          </p>

          <h2 className="mt-3 text-4xl font-black sm:text-5xl">
            ₦
            {balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <p className="mt-3 text-sm text-white/50">
            {user?.firstName} {user?.lastName}
          </p>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setShowFundForm(true);
              setMessage("");
            }}
            className="rounded-3xl bg-lime-400 p-6 text-left shadow-lg shadow-lime-900/5 transition hover:-translate-y-1 hover:bg-lime-300"
          >
            <p className="text-xl font-black">
              Fund Account
            </p>

            <p className="mt-2 text-sm text-[#111713]/60">
              Add money securely through Paystack.
            </p>
          </button>

          <Link
            href="/wallet/bank-details"
            className="block rounded-3xl bg-white p-6 text-left shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xl font-black">
              Withdraw
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Add or manage your bank account for withdrawals.
            </p>
          </Link>

          <Link
            href="/wallet/withdrawals"
            className="block rounded-3xl bg-white p-6 text-left shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="text-xl font-black">
              Withdrawal History
            </p>

            <p className="mt-2 text-sm text-gray-500">
              View your withdrawal requests and their current status.
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-7 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your wallet activity.
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {transactions.length}{" "}
              {transactions.length === 1
                ? "Transaction"
                : "Transactions"}
            </span>
          </div>

          {transactionsLoading ? (
            <div className="mt-8 py-8 text-center text-sm text-gray-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
              <p className="font-semibold text-gray-600">
                No transactions yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Your deposits, purchases and withdrawals
                will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {transactions.map((transaction) => {
                const isDeposit =
                  transaction.type === "DEPOSIT";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f9f5] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold">
                        {transaction.description ||
                          transaction.type}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-400">
                        {transaction.reference}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(
                          transaction.createdAt
                        ).toLocaleString("en-NG")}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`font-black ${
                          isDeposit ||
                          transaction.type === "MINING_REWARD"
                            ? "text-green-600"
                            : "text-[#111713]"
                        }`}
                      >
                        {isDeposit ||
                        transaction.type === "MINING_REWARD"
                          ? "+"
                          : "-"}
                        ₦
                        {Number(
                          transaction.amount
                        ).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold ${
                          transaction.status === "SUCCESS"
                            ? "text-green-600"
                            : transaction.status === "FAILED"
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showFundForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Wallet
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Fund Account
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowFundForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg font-bold"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              Enter the amount you want to add to your
              Shoppy wallet. You will be redirected to
              Paystack to complete the payment.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold">
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  ₦
                </span>

                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="5000"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFundAccount}
              disabled={funding}
              className="mt-6 w-full rounded-xl bg-[#111713] px-5 py-4 text-sm font-black text-white transition hover:bg-lime-400 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {funding
                ? "Connecting to Paystack..."
                : "Continue to Payment"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
          <p className="text-sm font-medium text-gray-500">
            Loading wallet...
          </p>
        </main>
      }
    >
      <WalletContent />
    </Suspense>
  );
}