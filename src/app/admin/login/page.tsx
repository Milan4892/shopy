"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Admin login failed.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 text-2xl font-black text-black">
            S
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            Shopy Admin
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage the Shopy platform
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email or phone
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(event.target.value)
                }
                placeholder="Enter email or phone"
                autoComplete="username"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            {message && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-black font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Shopy E Bikes · Admin Portal
        </p>
      </div>
    </main>
  );
}