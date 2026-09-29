"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Session = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  current: boolean;
};

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  async function loadSessions() {
    try {
      const response = await fetch("/api/security/sessions");
      const data = await response.json();

      if (response.ok && data.success) {
        setSessions(data.sessions);
      }
    } catch {
      setError("Unable to load active sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setChangingPassword(true);

    try {
      const response = await fetch(
        "/api/security/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwords),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to change password.");
        return;
      }

      setMessage(data.message);

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      await loadSessions();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function logoutSession(id: string) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/security/sessions/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to logout session.");
        return;
      }

      setMessage("Session logged out successfully.");
      await loadSessions();
    } catch {
      setError("Unable to logout session.");
    }
  }

  async function logoutOtherSessions() {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/security/sessions",
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to logout other sessions."
        );
        return;
      }

      setMessage(
        "All other active sessions have been logged out."
      );

      await loadSessions();
    } catch {
      setError("Unable to logout other sessions.");
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Security
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your password and active sessions.
            </p>
          </div>

          <Link
            href="/account"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Back to Account
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Change your account password securely.
            </p>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Current Password
              </label>

              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                New Password
              </label>

              <input
                type="password"
                value={passwords.newPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    newPassword: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm New Password
              </label>

              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(event) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </form>
        </section>

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                Active Sessions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage devices currently signed into your account.
              </p>
            </div>

            {sessions.filter((session) => !session.current).length >
              0 && (
              <button
                onClick={logoutOtherSessions}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout Other Sessions
              </button>
            )}
          </div>

          {loadingSessions ? (
            <p className="text-sm text-gray-500">
              Loading sessions...
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No active sessions found.
            </p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {session.userAgent ||
                            "Unknown device"}
                        </h3>

                        {session.current && (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Current Session
                          </span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                        <p>
                          IP:{" "}
                          {session.ipAddress || "Unavailable"}
                        </p>

                        <p>
                          Last active:{" "}
                          {formatDate(session.lastActiveAt)}
                        </p>

                        <p>
                          Expires:{" "}
                          {formatDate(session.expiresAt)}
                        </p>
                      </div>
                    </div>

                    {!session.current && (
                      <button
                        onClick={() =>
                          logoutSession(session.id)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">
              Two-Factor Authentication
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add another layer of protection to your Shoppy
              account.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">
              Two-factor authentication setup will be available
              after the authentication flow is implemented.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}