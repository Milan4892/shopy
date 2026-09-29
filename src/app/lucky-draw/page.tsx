"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Segment = {
  label: string;
  type: string;
  value: number;
  subtitle: string;
};

type DrawResult = {
  rewardType: string;
  rewardValue: number;
  spunAt: string;
};

const segments: Segment[] = [
  {
    label: "₦5,000",
    type: "WALLET_CREDIT",
    value: 5000,
    subtitle: "CASH",
  },
  {
    label: "S3 E-Bike",
    type: "S3_EBIKE",
    value: 0,
    subtitle: "E-BIKE",
  },
  {
    label: "TRY AGAIN",
    type: "BETTER_LUCK",
    value: 0,
    subtitle: "GIFT",
  },
  {
    label: "₦10,000",
    type: "WALLET_CREDIT",
    value: 10000,
    subtitle: "CASH",
  },
  {
    label: "S2 E-Bike",
    type: "S2_EBIKE",
    value: 0,
    subtitle: "E-BIKE",
  },
  {
    label: "TRY AGAIN",
    type: "BETTER_LUCK",
    value: 0,
    subtitle: "GIFT",
  },
];

export default function LuckyDrawPage() {
  const [available, setAvailable] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLuckyDraw() {
      try {
        const response = await fetch("/api/lucky-draw", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load Lucky Draw.");
          return;
        }

        setAvailable(Boolean(data.available));
        setHasSpun(Boolean(data.hasSpun));
        setResult(data.result || null);
      } catch {
        setError("Unable to load Lucky Draw.");
      } finally {
        setLoading(false);
      }
    }

    loadLuckyDraw();
  }, []);

  async function handleSpin() {
    if (spinning || !available) return;

    setError("");
    setSpinning(true);

    try {
      const response = await fetch("/api/lucky-draw", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to complete Lucky Draw.");
        setSpinning(false);
        return;
      }

      const drawResult: DrawResult = data.result;

      const winningIndex = segments.findIndex(
        (segment) =>
          segment.type === drawResult.rewardType &&
          segment.value === drawResult.rewardValue
      );

      const index = winningIndex >= 0 ? winningIndex : 0;

      const finalRotation =
        rotation + 360 * 6 - index * (360 / segments.length);

      setRotation(finalRotation);

      setTimeout(() => {
        setResult(drawResult);
        setHasSpun(true);
        setAvailable(false);
        setSpinning(false);
      }, 5300);
    } catch {
      setError("Something went wrong. Please try again.");
      setSpinning(false);
    }
  }

  function formatReward(drawResult: DrawResult) {
    if (drawResult.rewardType === "WALLET_CREDIT") {
      return `₦${drawResult.rewardValue.toLocaleString()}`;
    }

    if (drawResult.rewardType === "S3_EBIKE") {
      return "S3 E-Bike";
    }

    if (drawResult.rewardType === "S2_EBIKE") {
      return "S2 E-Bike";
    }

    return "Try Again";
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
            🎁
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950">
            Lucky Draw
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Spin the wheel and see what you get.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-red-50 px-5 py-4 text-center text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl shadow-black/5">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-lime-400" />

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Loading Lucky Draw...
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto mt-12 w-full max-w-[560px]">
              <div className="relative aspect-square w-full">
                <div className="absolute left-1/2 top-1 z-50 -translate-x-1/2">
                  <div className="relative flex flex-col items-center">
                    <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-t-[38px] border-l-transparent border-r-transparent border-t-gray-950" />

                    <div className="absolute top-0 h-3 w-3 rounded-full bg-lime-400" />
                  </div>
                </div>

                <div
                  className="absolute inset-[5%] rounded-full bg-gray-950 p-2 shadow-2xl sm:p-3"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transitionDuration: spinning ? "5.2s" : "0ms",
                    transitionTimingFunction:
                      "cubic-bezier(0.12, 0.72, 0.12, 1)",
                  }}
                >
                  <div className="relative h-full w-full rounded-full bg-white p-2">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "conic-gradient(from -30deg, #bef264 0deg 60deg, #ffffff 60deg 120deg, #d9f99d 120deg 180deg, #ffffff 180deg 240deg, #bef264 240deg 300deg, #ffffff 300deg 360deg)",
                      }}
                    />

                    <div className="absolute inset-[8%] rounded-full border border-gray-300" />

                    {segments.map((segment, index) => {
                      const angle =
                        -90 + index * (360 / segments.length);

                      const radius =
                        typeof window !== "undefined" && window.innerWidth < 640
                          ? 125
                          : 160;

                      const radians = (angle * Math.PI) / 180;

                      const x = Math.cos(radians) * radius;
                      const y = Math.sin(radians) * radius;

                      return (
                        <div
                          key={`${segment.label}-${index}`}
                          className="absolute left-1/2 top-1/2 z-20"
                          style={{
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                          }}
                        >
                          <div className="flex h-[62px] w-[112px] items-center justify-center rounded-2xl border-2 border-gray-950 bg-white px-2 shadow-lg sm:h-[70px] sm:w-[130px]">
                            <div className="text-center">
                              <div className="text-sm font-black leading-tight text-gray-950 sm:text-base">
                                {segment.label}
                              </div>

                              <div className="mt-1 text-[9px] font-black tracking-[0.18em] text-lime-600">
                                {segment.subtitle}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute left-1/2 top-1/2 z-40 flex h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[8px] border-gray-950 bg-white shadow-2xl sm:h-[145px] sm:w-[145px]">
                      <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-lime-400 text-5xl shadow-inner sm:h-[105px] sm:w-[105px] sm:text-6xl">
                        🎁
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-full border-[3px] border-lime-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-md text-center">
              {hasSpun && result ? (
                <div className="rounded-3xl border border-lime-200 bg-white p-8 shadow-xl shadow-black/5">
                  <div className="text-5xl">🎉</div>

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                    Congratulations
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-gray-950">
                    {formatReward(result)}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Your Lucky Draw has been completed.
                  </p>
                </div>
              ) : available ? (
                <button
                  type="button"
                  onClick={handleSpin}
                  disabled={spinning}
                  className="w-full rounded-2xl bg-gray-950 px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {spinning ? "SPINNING..." : "SPIN NOW"}
                </button>
              ) : (
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-black/5">
                  <div className="text-5xl">🎁</div>

                  <h2 className="mt-4 text-xl font-black text-gray-950">
                    No Spin Available
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your Lucky Draw is currently unavailable.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}