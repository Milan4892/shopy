"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ADMIN_ROLES, hasAnyAdminRole } from "@/lib/admin-roles";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || data.message || "Login failed");
        return;
      }

      setMessage("Login successful!");

      setTimeout(() => {
        const roles = data.user?.roles || [];

        if (hasAnyAdminRole(roles, ADMIN_ROLES)) {
          window.location.href = "/admin";
          return;
        }

        window.location.href = "/dashboard";
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#111713]">
      <Image
        src="/bikes/shopy%20bike.png"
        alt="Shoppy electric bike"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen">
        <section className="hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
          <div>
            <Link href="/products" className="text-3xl font-black">
              Shoppy
            </Link>
          </div>

          <div className="max-w-xl pb-16">
            <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-lime-400">
              Better Bikes. Bigger Dreams.
            </p>

            <h2 className="text-6xl font-black leading-tight">
              Ride Your <span className="text-lime-400">Dreams.</span>
            </h2>

            <p className="mt-5 max-w-md text-lg text-white/80">
              Premium bikes, better prices, and a smarter way to ride.
            </p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <Link
                href="/products"
                className="text-3xl font-black text-[#111713] lg:hidden"
              >
                Shoppy
              </Link>

              <h1 className="mt-4 text-3xl font-black text-[#111713]">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Login to continue to your Shoppy account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#111713]">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#111713]">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {message && (
                <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-[#111713]">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#111713] px-5 py-3 font-bold text-white transition hover:bg-lime-500 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#111713] hover:text-lime-600"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}