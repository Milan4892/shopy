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

type WalletData = {
  balance: number;
};

type VipData = {
  level: number;
  name: string;
};

export default function WithdrawPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [vip, setVip] = useState<VipData | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  useEffect(() => {
    async function loadData() {
      try {
        const [walletResponse, bankResponse, vipResponse] = await Promise.all([
          fetch("/api/auth/me", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/wallet/bank-details", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/vip", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (
          walletResponse.status === 401 ||
          bankResponse.status === 401 ||
          vipResponse.status === 401
        ) {
          window.location.href = "/login";
          return;
        }

        const walletData = await walletResponse.json();
        const bankData = await bankResponse.json();
        const vipData = await vipResponse.json();

        if (walletData.user?.wallet) {
          setWallet({
            balance: Number(walletData.user.wallet.balance || 0),
          });
        }

        if (bankData.account) {
          setAccount(bankData.account);
        }

        if (vipData.vip && vipData.vip.level > 0) {
          setVip({
            level: vipData.vip.level,
            name: vipData.vip.name,
          });
        }
      } catch {
        setMessage("Unable to load withdrawal details.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const withdrawalAmount = Number(amount) || 0;
  const fee = vip ? 0 : withdrawalAmount * 0.1;
  const payoutAmount = Math.max(withdrawalAmount - fee, 0);

  async function handleWithdraw() {
    setMessage("");

    if (!account) {
      setMessage("Please add your bank details first.");
      setMessageType("error");
      return;
    }

    if (!withdrawalAmount || withdrawalAmount < 5000) {
      setMessage("Minimum withdrawal amount is ₦5,000.");
      setMessageType("error");
      return;
    }

    if (wallet && withdrawalAmount > wallet.balance) {
      setMessage("Insufficient wallet balance.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: withdrawalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to submit withdrawal.");
        setMessageType("error");
        return;
      }

      setMessage(
        data.message || "Withdrawal request submitted successfully."
      );
      setMessageType("success");
      setAmount("");

      if (wallet) {
        setWallet({
          balance: wallet.balance - withdrawalAmount,
        });
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to submit withdrawal.");
      setMessageType("error");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/wallet"
          className="text-sm font-semibold text-gray-500 hover:text-black"
        >
          ← Back to Wallet
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg shadow-black/5">
          <h1 className="text-3xl font-black">Withdraw</h1>

          <p className="mt-2 text-gray-500">
            Withdraw money from your Shoppy wallet to your bank account.
          </p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="mt-1 text-3xl font-black">
              ₦{wallet?.balance.toLocaleString() || "0"}
            </p>
          </div>

          {account ? (
            <div className="mt-6 rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-500">
                Withdrawal Account
              </p>

              <p className="mt-2 text-lg font-bold">{account.bankName}</p>

              <p className="mt-1 text-gray-600">{account.accountNumber}</p>

              <p className="mt-1 text-gray-600">{account.accountName}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-5">
              <p className="font-bold">No bank account saved</p>

              <p className="mt-1 text-sm text-gray-500">
                Add your bank account before making a withdrawal.
              </p>

              <Link
                href="/wallet/bank-details"
                className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
              >
                Add Bank Account
              </Link>
            </div>
          )}

          {account && (
            <>
              <div className="mt-6">
                <label className="text-sm font-semibold">
                  Withdrawal Amount
                </label>

                <input
                  type="number"
                  min="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-4 outline-none focus:border-black"
                />
              </div>

              {withdrawalAmount >= 5000 && (
                <div className="mt-4 rounded-2xl bg-gray-50 p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Withdrawal</span>
                    <span className="font-semibold">
                      ₦{withdrawalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-gray-500">Withdrawal Fee</span>
                    <span className="font-semibold">
                      ₦{fee.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold">You Receive</span>
                      <span className="text-lg font-black text-green-600">
                        ₦{payoutAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    {vip
                      ? `${vip.name}: no withdrawal fee.`
                      : "A 10% withdrawal fee applies to non-VIP accounts."}
                  </p>
                </div>
              )}

              {message && (
                <p
                  className={`mt-4 rounded-xl p-3 text-sm font-semibold ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="button"
                onClick={handleWithdraw}
                className="mt-6 w-full rounded-2xl bg-black px-5 py-4 font-bold text-white transition hover:opacity-90"
              >
                Withdraw
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}