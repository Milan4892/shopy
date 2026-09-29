"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type MiningBike = {
  id: string;
  status: string;
  product: {
    sku: string;
    name: string;
    imageUrl: string | null;
    miningReward: string;
    miningLimitPerDay: number;
  };
};

type MiningData = {
  bike: MiningBike | null;
  minedToday: number;
  dailyLimit: number;
  reward: string;
  balance: string;
  canMine: boolean;
  isWeekend: boolean;
};

export default function MiningPage() {
  const [data, setData] = useState<MiningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  async function loadMiningData() {
    try {
      const response = await fetch("/api/mining", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        setMessage(result.message || "Unable to load mining data.");
        setMessageType("error");
        return;
      }

      setData(result);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load mining data.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMiningData();
  }, []);

  async function handleMining() {
    if (mining) {
      return;
    }

    setMining(true);
    setMessage("");

    try {
      const response = await fetch("/api/mining", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Mining could not be completed.");
        setMessageType("error");
        return;
      }

      setMessage(
        `Mining successful. You earned ₦${Number(
          result.reward
        ).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`
      );

      setMessageType("success");

      await loadMiningData();
    } catch (error) {
      console.error(error);
      setMessage("Unable to complete mining.");
      setMessageType("error");
    } finally {
      setMining(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading mining...
        </p>
      </main>
    );
  }

  const balance = Number(data?.balance ?? 0);
  const reward = Number(data?.reward ?? 0);
  const progress = data?.dailyLimit
    ? Math.min(
        ((data.minedToday || 0) / data.dailyLimit) * 100,
        100
      )
    : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ea] text-[#111713]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-black">
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
              className="text-lime-600"
            >
              Mining
            </Link>

            <Link
              href="/wallet"
              className="text-gray-500 transition hover:text-[#111713]"
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
            Earn from your bike
          </p>

          <h1 className="mt-1 text-4xl font-black">
            Mining
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Mine with your active Shoppy bike and earn rewards.
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

        {data?.isWeekend && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-800">
            Mining is unavailable on Saturdays and Sundays.
          </div>
        )}

        {!data?.bike ? (
          <section className="mt-8 rounded-3xl bg-white p-10 text-center shadow-xl shadow-black/5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 text-3xl">
              🚲
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No active bike
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You need an active Shoppy bike before you can start mining.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-[#111713] px-5 py-3 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
            >
              Acquire a Bike
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5">
                <div className="relative h-64">
                  <Image
                    src={
                      data.bike.product.imageUrl ||
                      "/bikes/shopy%20bike.png"
                    }
                    alt={data.bike.product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-lime-400 px-3 py-1 text-xs font-black">
                    {data.bike.product.sku}
                  </div>

                  <div className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                    ACTIVE
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Current Bike
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {data.bike.product.name}
                  </h2>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <InfoBox
                      label="Reward"
                      value={`₦${reward.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    />

                    <InfoBox
                      label="Daily Limit"
                      value={`${data.dailyLimit}`}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-[#111713] p-7 text-white shadow-xl shadow-black/10">
                <p className="text-sm font-medium text-white/50">
                  Available Wallet Balance
                </p>

                <h2 className="mt-3 text-4xl font-black">
                  ₦
                  {balance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h2>

                <div className="mt-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      Today's Mining
                    </span>

                    <span className="font-black">
                      {data.minedToday} / {data.dailyLimit}
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-lime-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMining}
                  disabled={
                    mining ||
                    data.isWeekend ||
                    data.minedToday >= data.dailyLimit
                  }
                  className="mt-8 w-full rounded-2xl bg-lime-400 px-6 py-4 text-sm font-black text-[#111713] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {mining
                    ? "Mining..."
                    : data.isWeekend
                      ? "Mining Unavailable"
                      : data.minedToday >= data.dailyLimit
                        ? "Daily Limit Reached"
                        : "Start Mining"}
                </button>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-lg shadow-black/5">
              <h2 className="text-xl font-black">
                How Mining Works
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Step
                  number="01"
                  title="Own a Bike"
                  text="Acquire an active Shoppy bike."
                />

                <Step
                  number="02"
                  title="Start Mining"
                  text="Use your daily mining attempts."
                />

                <Step
                  number="03"
                  title="Earn Rewards"
                  text="Your reward is credited directly to your wallet."
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#eef3ea] p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-[#eef3ea] p-5">
      <span className="text-xs font-black text-lime-600">
        {number}
      </span>

      <h3 className="mt-2 font-black">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}