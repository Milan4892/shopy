"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  roles: string[];
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          window.location.href = "/login";
          return;
        }

        setUser(data.user);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

 async function handleLogout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "/login";
      return;
    }

    alert(data.message || "Unable to logout.");
  } catch {
    alert("Unable to logout. Please try again.");
  }
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading account...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef3ea] text-[#111713]">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
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

      <div className="mx-auto max-w-5xl px-5 py-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Account
          </p>

          <h1 className="mt-1 text-4xl font-black">
            My Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your Shoppy account and preferences.
          </p>
        </div>

        <section className="mt-8 rounded-3xl bg-white/90 p-6 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Account Information
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {user?.firstName} {user?.lastName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {user?.email}
              </p>
            </div>

            <span className="rounded-full bg-lime-100 px-3 py-2 text-xs font-black text-green-700">
              {user?.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Account ID" value={user?.id || "-"} />
            <InfoItem label="Phone" value={user?.phone || "Not provided"} />
            <InfoItem
              label="Account Type"
              value={user?.roles?.join(", ") || "CUSTOMER"}
            />
            <InfoItem label="Email" value={user?.email || "-"} />
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <AccountCard
            href="/notifications"
            title="Notifications"
            description="View your account notifications."
          />

          <AccountCard
            href="/settings"
            title="Settings"
            description="Manage your account preferences."
          />

          <AccountCard
            href="/wallet/bank-details"
            title="Bank Details"
            description="View your withdrawal account."
          />

          <AccountCard
            href="/wallet"
            title="Wallet & Transactions"
            description="Manage your balance and wallet activity."
          />

          <AccountCard
            href="/wallet/withdrawals"
            title="Withdrawal History"
            description="View your withdrawal requests."
          />

          <AccountCard
            href="/security"
            title="Security"
            description="Manage password and account security."
          />
        </section>

        <section className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-red-200 bg-white p-5 text-left transition hover:border-red-300 hover:bg-red-50"
          >
            <h2 className="font-black text-red-600">
              Logout
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Sign out of your Shoppy account.
            </p>
          </button>
        </section>
      </div>
    </main>
  );
}

function AccountCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-md shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h2 className="font-black">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </Link>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#eef3ea] p-4">
      <p className="text-xs font-semibold text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-bold">
        {value}
      </p>
    </div>
  );
}