"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  speed: number;
  batteryRange: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  miningLimitPerDay: number;
  miningReward: string;
};

const bikeImages: Record<string, string> = {
  "SHOPY-EBIKE-S1": "/bikes/s1.jpeg",
  "SHOPY-EBIKE-S2": "/bikes/s2.jpeg",
  "SHOPY-EBIKE-S3": "/bikes/s3.jpeg",
  "SHOPY-EBIKE-S4": "/bikes/s4.jpeg",
  "SHOPY-EBIKE-S5": "/bikes/s5.jpeg",
  "SHOPY-EBIKE-S6": "/bikes/s6.jpeg",
  "SHOPY-EBIKE-S7": "/bikes/s7.jpeg",
  "SHOPY-EBIKE-S8": "/bikes/s8.jpeg",
  "SHOPY-EBIKE-S9": "/bikes/s9.jpeg",
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [acquiring, setAcquiring] = useState(false);
  const [error, setError] = useState("");
  const [acquireMessage, setAcquireMessage] = useState("");
  const [showFundWarning, setShowFundWarning] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const authData = await authResponse.json();

        if (!authResponse.ok || !authData.authenticated) {
          window.location.href = "/login";
          return;
        }

        setUser(authData.user);

        const productResponse = await fetch(`/api/products/${id}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!productResponse.ok) {
          throw new Error("Product not found");
        }

        const productData = await productResponse.json();

        if (!productData.product) {
          throw new Error("Product not found");
        }

        setProduct(productData.product);
      } catch (error) {
        console.error(error);
        setError("Failed to load bike.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPage();
    }
  }, [id]);

  async function handleAcquire() {
    if (!product || acquiring) {
      return;
    }

    setAcquiring(true);
    setAcquireMessage("");

    try {
      const response = await fetch(
        `/api/products/${product.id}/acquire`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          response.status === 400 &&
          data.message === "Insufficient wallet balance."
        ) {
          setShowFundWarning(true);
          return;
        }

        setAcquireMessage(
          data.message || "Unable to acquire this bike."
        );

        return;
      }

      window.location.href = "/my-bikes";
    } catch (error) {
      console.error(error);
      setAcquireMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setAcquiring(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-lime-500" />
          <p className="font-medium text-gray-600">
            Loading bike...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#eef3ea] px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-black">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Product not found"}
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-[#111713] px-6 py-3 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Back to E-Bikes
          </Link>
        </div>
      </main>
    );
  }

  const image =
    product.imageUrl ||
    bikeImages[product.sku] ||
    "/bikes/shopy%20bike.png";

  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-[#eef3ea] text-[#111713]">
      <div className="pointer-events-none fixed left-[-150px] top-[-150px] h-[450px] w-[450px] rounded-full bg-lime-200/40 blur-3xl" />

      <div className="pointer-events-none fixed right-[-150px] top-[300px] h-[450px] w-[450px] rounded-full bg-green-200/30 blur-3xl" />

      <nav className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 font-black text-black shadow-lg shadow-lime-400/20">
              S
            </div>

            <span className="text-xl font-black tracking-tight">
              SHOPY
            </span>
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
              className="text-lime-600"
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
              className="text-gray-500 transition hover:text-[#111713]"
            >
              Wallet
            </Link>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold">
              {user?.firstName} {user?.lastName}
            </p>

            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 border-t border-black/5 px-5 py-3 text-xs font-semibold md:hidden">
          <Link href="/dashboard">Dashboard</Link>

          <Link href="/products" className="text-lime-600">
            E-Bikes
          </Link>

          <Link href="/my-bikes">My Bikes</Link>

          <Link href="/wallet">Wallet</Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#111713]"
        >
          ← Back to E-Bikes
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
          <section className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-black/5">
            <div className="relative h-[330px] sm:h-[450px]">
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute left-5 top-5 rounded-full bg-lime-400 px-4 py-2 text-xs font-black">
                {product.sku}
              </div>

              <div
                className={`absolute right-5 top-5 rounded-full px-4 py-2 text-xs font-bold ${
                  inStock
                    ? "bg-white/90 text-green-700"
                    : "bg-red-500 text-white"
                }`}
              >
                {inStock ? "In Stock" : "Sold Out"}
              </div>
            </div>
          </section>

          <section>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-600">
              Shoppy Electric Bike
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-500">
              {product.description ||
                "A premium Shoppy electric bike built for modern riders."}
            </p>

            <div className="mt-7">
              <p className="text-sm font-medium text-gray-400">
                Price
              </p>

              <p className="mt-1 text-4xl font-black">
                ₦
                {Number(product.price).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoCard
                label="Speed"
                value={String(product.speed)}
              />

              <InfoCard
                label="Range"
                value={String(product.batteryRange)}
              />

              <InfoCard
                label="Mining"
                value={`₦${Number(
                  product.miningReward
                ).toLocaleString("en-NG")}`}
              />

              <InfoCard
                label="Daily Limit"
                value={String(product.miningLimitPerDay)}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-lime-100 bg-lime-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Availability
                  </p>

                  <p className="mt-1 text-lg font-black">
                    {product.stock} bike
                    {product.stock === 1 ? "" : "s"} available
                  </p>
                </div>

                <div className="rounded-full bg-white px-3 py-2 text-xs font-bold text-green-700 shadow-sm">
                  {inStock ? "Available" : "Sold Out"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcquire}
              disabled={!inStock || acquiring}
              className="mt-6 w-full rounded-2xl bg-[#111713] px-6 py-4 text-sm font-black text-white shadow-xl shadow-black/10 transition hover:bg-lime-400 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {acquiring
                ? "Processing..."
                : inStock
                  ? "Acquire Bike"
                  : "Sold Out"}
            </button>

            {acquireMessage && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {acquireMessage}
              </div>
            )}
          </section>
        </div>
      </div>

      {showFundWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Insufficient Wallet Balance
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your available wallet balance is not enough to
              acquire this bike. Please fund your account to
              continue with your purchase.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFundWarning(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <Link
                href="/wallet"
                className="flex-1 rounded-xl bg-[#111713] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
              >
                Fund Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}