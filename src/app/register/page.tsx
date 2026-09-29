"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setReferralCode(ref.trim().toUpperCase());
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          referralCode: referralCode || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create account.");
        return;
      }

      setSuccess(true);
      setMessage("Account created successfully!");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setReferralCode("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
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
              Start Your Journey
            </p>

            <h2 className="text-6xl font-black leading-tight">
              Ride Your <span className="text-lime-400">Dreams.</span>
            </h2>

            <p className="mt-5 max-w-md text-lg text-white/80">
              Create your Shoppy account and discover a smarter way to own and
              manage your bikes.
            </p>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-7">
              <Link
                href="/products"
                className="text-3xl font-black text-[#111713] lg:hidden"
              >
                Shoppy
              </Link>

              <h1 className="mt-4 text-3xl font-black text-[#111713]">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Create your Shoppy account to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {referralCode && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Referral Code
                  </label>

                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="w-full rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 font-semibold text-[#111713] outline-none"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    You were invited to join Shoppy.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    success
                      ? "bg-lime-100 text-green-700"
                      : "bg-gray-100 text-[#111713]"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#111713] px-5 py-3 font-bold text-white transition hover:bg-lime-500 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#111713] hover:text-lime-600"
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}