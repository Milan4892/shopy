"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
};

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          setAdmin(data.user);
        }
      } catch (error) {
        console.error("Failed to load admin:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-lime-500" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Unable to load administrator information
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Please refresh the page or sign in again.
        </p>
      </div>
    );
  }

  const fullName = `${admin.firstName} ${admin.lastName}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator account and security settings.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-100 text-lg font-bold text-lime-700">
              {admin.firstName.charAt(0)}
              {admin.lastName.charAt(0)}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950">
                {fullName}
              </h2>
              <p className="text-sm text-gray-500">{admin.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
              {admin.roles.includes("ADMIN") ? "ADMIN" : admin.roles.join(", ")}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {admin.status}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Admin Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your administrator account information.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Full Name
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {fullName}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {admin.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {admin.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Administrator ID
              </p>
              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {admin.id}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Security
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Protect and manage your administrator account.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left opacity-60"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Change Password
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Update your administrator password.
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400">
                Coming next
              </span>
            </button>

            <button
              type="button"
              disabled
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left opacity-60"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Session Management
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Manage active administrator sessions.
                </p>
              </div>
              <span className="text-xs font-medium text-gray-400">
                Coming next
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-950">
            Notification Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Control how administrator notifications will be handled.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                System Notifications
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Receive important system and security notifications.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-gray-300 accent-lime-500"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Transaction Alerts
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Receive alerts about important wallet and withdrawal activity.
              </p>
            </div>

            <input
              type="checkbox"
              defaultChecked
              className="h-5 w-5 rounded border-gray-300 accent-lime-500"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-950">
            Account Security
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Important information about your administrator access.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Role
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              {admin.roles.join(", ") || "ADMIN"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Account Status
            </p>
            <p className="mt-2 text-sm font-semibold text-green-600">
              {admin.status}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Access Level
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900">
              Administrator
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="inline-flex h-11 items-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Back to Dashboard
        </Link>

        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          Back to Shopy
        </Link>
      </div>
    </div>
  );
}
