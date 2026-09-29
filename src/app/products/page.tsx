"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

type User = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const productsResponse = await fetch("/api/products", {
          credentials: "include",
          cache: "no-store",
        });

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const productsData = await productsResponse.json();

        const activeProducts = (productsData.products || []).filter(
          (product: Product) => product.id && product.isActive
        );

        setProducts(activeProducts);
      } catch (error) {
        console.error(error);
        setError("Failed to load bikes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-lime-500" />
          <p className="text-sm font-medium text-gray-500">
            Loading Shoppy Marketplace...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#eef3ea] px-6 py-20 text-[#111713]">
        <div className="mx-auto max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-black">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#111713] px-6 py-3 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ea] text-[#111713]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />

      <nav className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
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

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8">
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lime-600">
            Shoppy Marketplace
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Find Your Next Ride
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Browse the available Shoppy electric bikes and choose the ride
            that fits you.
          </p>
        </section>

        {products.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-lg shadow-black/5">
            <h2 className="text-2xl font-black">
              No bikes available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no active bikes in the marketplace.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image =
                product.imageUrl ||
                bikeImages[product.sku] ||
                "/bikes/shopy%20bike.png";

              const inStock = product.stock > 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-lg shadow-black/5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-lime-400 px-3 py-1 text-xs font-black text-[#111713]">
                      {product.sku}
                    </div>

                    <div
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                        inStock
                          ? "bg-white/90 text-green-700"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {inStock ? "In Stock" : "Sold Out"}
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-black">
                      {product.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {product.description ||
                        "A premium Shoppy electric bike built for modern riders."}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#eef3ea] p-3">
                        <p className="text-[11px] text-gray-400">
                          Speed
                        </p>
                        <p className="mt-1 font-black">
                          {product.speed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#eef3ea] p-3">
                        <p className="text-[11px] text-gray-400">
                          Range
                        </p>
                        <p className="mt-1 font-black">
                          {product.batteryRange}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#eef3ea] p-3">
                        <p className="text-[11px] text-gray-400">
                          Mining Reward
                        </p>
                        <p className="mt-1 font-black">
                          ₦
                          {Number(
                            product.miningReward
                          ).toLocaleString("en-NG")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#eef3ea] p-3">
                        <p className="text-[11px] text-gray-400">
                          Daily Limit
                        </p>
                        <p className="mt-1 font-black">
                          {product.miningLimitPerDay}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">
                          Price
                        </p>

                        <p className="mt-1 text-2xl font-black">
                          ₦
                          {Number(product.price).toLocaleString(
                            "en-NG",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-gray-400">
                        {product.stock} available
                      </span>
                    </div>

                    <Link
                      href={`/products/${product.id}`}
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#111713] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713]"
                    >
                      View Bike
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}