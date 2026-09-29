"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Bike = {
  id: string;
  status: string;
  purchasePrice: string;
  acquiredAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    speed: number;
    batteryRange: number;
    miningReward: string;
    miningLimitPerDay: number;
  };
};

export default function MyBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBikes() {
      try {
        const response = await fetch("/api/my-bikes", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          setError(data.message || "Unable to load your bikes.");
          return;
        }

        setBikes(data.bikes || []);
      } catch {
        setError("Unable to load your bikes.");
      } finally {
        setLoading(false);
      }
    }

    loadBikes();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading your bikes...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3ea] text-[#111713]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-black">
            Shoppy
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#111713] px-4 py-2 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Your collection
          </p>

          <h1 className="mt-1 text-4xl font-black">
            My Bikes
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage the bikes connected to your Shoppy account.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {bikes.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-black/5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-100 text-3xl">
              🚲
            </div>

            <h2 className="mt-5 text-2xl font-black">
              You have no bikes yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Visit the marketplace to explore available bikes and acquire
              your first one.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-[#111713] px-5 py-3 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
            >
              Browse Bikes
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {bikes.map((bike) => (
              <article
                key={bike.id}
                className="overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-lg shadow-black/5"
              >
                <div className="relative h-56 bg-gray-100">
                  <Image
                    src={
                      bike.product.imageUrl ||
                      "/bikes/shopy%20bike.png"
                    }
                    alt={bike.product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-lime-400 px-3 py-1 text-xs font-black text-[#111713]">
                    {bike.status}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {bike.product.sku}
                      </p>

                      <h2 className="mt-1 text-2xl font-black">
                        {bike.product.name}
                      </h2>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Purchase Price
                      </p>

                      <p className="mt-1 font-black">
                        ₦
                        {Number(
                          bike.purchasePrice
                        ).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  {bike.product.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      {bike.product.description}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoBox
                      label="Speed"
                      value={`${bike.product.speed}`}
                    />

                    <InfoBox
                      label="Range"
                      value={`${bike.product.batteryRange}`}
                    />

                    <InfoBox
                      label="Mining"
                      value={`₦${Number(
                        bike.product.miningReward
                      ).toLocaleString("en-NG")}`}
                    />

                    <InfoBox
                      label="Daily Limit"
                      value={`${bike.product.miningLimitPerDay}`}
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                    <div>
                      <p className="text-xs text-gray-400">
                        Acquired
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {new Date(
                          bike.acquiredAt
                        ).toLocaleDateString("en-NG")}
                      </p>
                    </div>

                    <Link
                      href="/mining"
                      className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-bold text-[#111713] transition hover:bg-lime-300"
                    >
                      Mine
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
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
    <div className="rounded-xl bg-[#eef3ea] p-3">
      <p className="text-[11px] font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}