"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Settings = {
  emailNotifications: boolean;
  transactionNotifications: boolean;
  miningNotifications: boolean;
  marketingNotifications: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.settings);
        }
      });
  }, []);

  async function updateSetting(
    field: keyof Settings,
    value: boolean
  ) {
    if (!settings) return;

    const updated = {
      ...settings,
      [field]: value,
    };

    setSettings(updated);
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setSettings(settings);
        setMessage(data.message || "Failed to save settings");
        return;
      }

      setMessage("Settings saved");
    } catch {
      setSettings(settings);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </main>
    );
  }

  const options = [
    {
      key: "emailNotifications" as const,
      title: "Email Notifications",
      description: "Receive important account updates by email.",
    },
    {
      key: "transactionNotifications" as const,
      title: "Transaction Notifications",
      description: "Receive notifications about wallet transactions and withdrawals.",
    },
    {
      key: "miningNotifications" as const,
      title: "Mining Notifications",
      description: "Receive notifications related to mining activity and rewards.",
    },
    {
      key: "marketingNotifications" as const,
      title: "Marketing Notifications",
      description: "Receive promotional offers and Shoppy announcements.",
    },
  ];

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-5 text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your Shoppy account preferences.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>

          <div className="mt-6 divide-y divide-gray-100">
            {options.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between gap-6 py-5"
              >
                <div>
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {option.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateSetting(option.key, !settings[option.key])
                  }
                  disabled={saving}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    settings[option.key]
                      ? "bg-lime-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      settings[option.key]
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </main>
  );
}