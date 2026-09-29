"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Referral = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
  referredAt: string;
};

type ReferralData = {
  code: string | null;
  link: string | null;
  count: number;
  target: number;
  completed: boolean;
  reward: string;
  referrals: Referral[];
};

export default function ReferralsPage() {
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadReferrals() {
      try {
        const response = await fetch("/api/referrals", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          setMessage(data.message || "Unable to load referrals.");
          return;
        }

        setReferral(data.referral);
      } catch {
        setMessage("Unable to load referrals.");
      } finally {
        setLoading(false);
      }
    }

    loadReferrals();
  }, []);

  async function copyReferralLink() {
    if (!referral?.link) return;

    try {
      await navigator.clipboard.writeText(referral.link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setMessage("Unable to copy referral link.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading referrals...
        </p>
      </main>
    );
  }

  const progress = referral
    ? Math.min((referral.count / referral.target) * 100, 100)
    : 0;

  return (
    <main className="min-h-screen bg-[#eef3ea] text-[#111713]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-black">
            Shoppy
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#111713] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-lime-400 hover:text-[#111713]"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <section>
          <p className="text-sm font-medium text-gray-500">
            Shoppy Referral Program
          </p>

          <h1 className="mt-1 text-4xl font-black sm:text-5xl">
            Refer & Earn
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Invite new users to join Shoppy and complete your referral
            milestone to receive your free S3 E-Bike.
          </p>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-medium shadow-sm">
            {message}
          </div>
        )}

        {referral && (
          <>
            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl bg-[#111713] p-7 text-white shadow-xl shadow-black/10 lg:col-span-2">
                <p className="text-sm font-medium text-white/60">
                  Your Referral Code
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-wider text-lime-400">
                  {referral.code || "Not available"}
                </h2>

                <p className="mt-4 text-sm text-white/70">
                  Share your referral link with people who are new to Shoppy.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={referral.link || ""}
                    readOnly
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={copyReferralLink}
                    disabled={!referral.link}
                    className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-black text-[#111713] transition hover:bg-lime-300 disabled:opacity-50"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7 shadow-lg shadow-black/5">
                <p className="text-sm font-medium text-gray-500">
                  Successful Referrals
                </p>

                <h2 className="mt-3 text-5xl font-black">
                  {referral.count}
                  <span className="text-2xl text-gray-400">
                    /{referral.target}
                  </span>
                </h2>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  {referral.completed
                    ? "Milestone completed!"
                    : `${referral.target - referral.count} more referral${
                        referral.target - referral.count === 1 ? "" : "s"
                      } to go.`}
                </p>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-lime-200 bg-lime-50 p-7 shadow-lg shadow-black/5">
              <p className="text-sm font-bold uppercase tracking-wider text-green-700">
                Referral Reward
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Refer 3 New Users
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Invite 3 new users to join Shoppy and get{" "}
                <span className="font-black text-[#111713]">
                  1 S3 E-Bike FREE
                </span>
                .
              </p>

              <div
                className={`mt-5 inline-flex rounded-full px-4 py-2 text-xs font-black ${
                  referral.completed
                    ? "bg-green-600 text-white"
                    : "bg-white text-[#111713]"
                }`}
              >
                {referral.completed
                  ? "REWARD MILESTONE COMPLETED"
                  : `${referral.count}/${referral.target} COMPLETED`}
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">
                  Your Referrals
                </h2>

                <span className="text-xs font-semibold text-gray-400">
                  {referral.count} successful
                </span>
              </div>

              <div className="mt-4">
                {referral.referrals.length === 0 ? (
                  <div className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-black/5">
                    <p className="text-lg font-black">
                      No referrals yet
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Share your referral link to invite your first new user.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {referral.referrals.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-3xl bg-white p-6 shadow-lg shadow-black/5"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-100 font-black text-green-700">
                          {item.firstName.charAt(0).toUpperCase()}
                        </div>

                        <h3 className="mt-4 font-black">
                          {item.firstName} {item.lastName}
                        </h3>

                        <p className="mt-1 break-all text-sm text-gray-500">
                          {item.email}
                        </p>

                        <p className="mt-4 text-xs font-medium text-gray-400">
                          Joined{" "}
                          {new Date(item.joinedAt).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}