"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type VipData = {
  level: number;
  name: string;
  miningBonus: number;
  freeWithdrawal: boolean;
  hiddenFees: boolean;
  monthlyAllowance: number;
};

type VipResponse = {
  success: boolean;
  vip: VipData;
  bikeCounts: Record<string, number>;
  totalActiveBikes: number;
};

const levels = [
  {
    level: 1,
    name: "VIP 1",
    sku: "SHOPY-EBIKE-S4",
    required: 3,
    bonus: 3,
    allowance: 0,
  },
  {
    level: 2,
    name: "VIP 2",
    sku: "SHOPY-EBIKE-S5",
    required: 2,
    bonus: 5,
    allowance: 0,
  },
  {
    level: 3,
    name: "VIP 3",
    sku: "SHOPY-EBIKE-S6",
    required: 2,
    bonus: 8,
    allowance: 10000,
  },
  {
    level: 4,
    name: "VIP 4",
    sku: "SHOPY-EBIKE-S9",
    required: 2,
    bonus: 10,
    allowance: 30000,
  },
];

export default function VipPage() {
  const [data, setData] = useState<VipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVip() {
      try {
        const response = await fetch("/api/vip", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || "Unable to load VIP information.");
          return;
        }

        setData(result);
      } catch {
        setError("Unable to load VIP information.");
      } finally {
        setLoading(false);
      }
    }

    loadVip();
  }, []);

  function getBikeCount(sku: string) {
    return data?.bikeCounts?.[sku] ?? 0;
  }

  function getProgress(level: (typeof levels)[number]) {
    const count = getBikeCount(level.sku);
    return Math.min(100, Math.round((count / level.required) * 100));
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-bold text-gray-500 transition hover:text-black"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400 text-3xl shadow-lg">
            👑
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950">
            VIP
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Your VIP benefits are based on your active e-bike ownership.
          </p>
        </div>

        {loading && (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl shadow-black/5">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-lime-400" />
            <p className="mt-4 text-sm font-semibold text-gray-500">
              Loading VIP information...
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 px-5 py-4 text-center text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <section className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] bg-gray-950 p-6 text-white shadow-2xl sm:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">
                    Current Status
                  </p>

                  <h2 className="mt-3 text-4xl font-black">
                    {data.vip.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    {data.totalActiveBikes} active e-bike
                    {data.totalActiveBikes === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-lime-400 text-5xl shadow-lg">
                  👑
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-gray-400">
                    Mining Bonus
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    +{data.vip.miningBonus}%
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-gray-400">
                    Withdrawal
                  </p>
                  <p className="mt-2 text-lg font-black">
                    {data.vip.freeWithdrawal ? "Free" : "Standard"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-gray-400">
                    Hidden Fees
                  </p>
                  <p className="mt-2 text-lg font-black">
                    {data.vip.hiddenFees ? "Applicable" : "None"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-bold text-gray-400">
                    Monthly Allowance
                  </p>
                  <p className="mt-2 text-lg font-black">
                    {data.vip.monthlyAllowance > 0
                      ? `₦${data.vip.monthlyAllowance.toLocaleString()}`
                      : "—"}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-gray-950">
                  VIP Levels
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your current ownership and VIP status are shown below.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {levels.map((level) => {
                  const count = getBikeCount(level.sku);
                  const completed = count >= level.required;
                  const current = data.vip.level === level.level;

                  return (
                    <div
                      key={level.level}
                      className={`rounded-3xl bg-white p-6 shadow-lg shadow-black/5 ${
                        current
                          ? "ring-2 ring-lime-400"
                          : "border border-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-600">
                            Level {level.level}
                          </p>

                          <h3 className="mt-2 text-2xl font-black text-gray-950">
                            {level.name}
                          </h3>
                        </div>

                        {current && (
                          <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-700">
                            CURRENT
                          </span>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-500">
                            S{level.level === 1 ? "4" : level.level === 2 ? "5" : level.level === 3 ? "6" : "9"} E-Bikes
                          </span>

                          <span className="text-sm font-black text-gray-950">
                            {count} / {level.required}
                          </span>
                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-lime-400 transition-all"
                            style={{
                              width: `${getProgress(level)}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs font-semibold text-gray-400">
                          {completed
                            ? "Requirement completed"
                            : `${level.required - count} more required`}
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Mining bonus
                          </span>
                          <span className="font-black text-gray-950">
                            +{level.bonus}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Withdrawal
                          </span>
                          <span className="font-black text-gray-950">
                            Free
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Hidden fees
                          </span>
                          <span className="font-black text-gray-950">
                            None
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Monthly allowance
                          </span>
                          <span className="font-black text-gray-950">
                            {level.allowance > 0
                              ? `₦${level.allowance.toLocaleString()}`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}