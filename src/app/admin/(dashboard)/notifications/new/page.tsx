"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAnnouncementPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send announcement");
      }

      setSuccess(
        `Announcement sent successfully to ${data.recipients} customers.`
      );

      setTitle("");
      setMessage("");

      setTimeout(() => {
        router.push("/admin/notifications");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send announcement"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/notifications"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          ← Back to Notifications
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-950">
          New Announcement
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Send a welcome announcement to all active customers.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-950">
            📢 Broadcast Announcement
          </p>
          <p className="mt-1 text-sm text-gray-600">
            This announcement will be sent to every active customer. It will
            appear as an unread notification when they log in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              placeholder="Welcome to Shopy"
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-black"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {title.length}/150
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Notification Type
            </label>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-black"
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="WELCOME">Welcome</option>
              <option value="SYSTEM">System</option>
              <option value="PROMOTION">Promotion</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Message
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={5000}
              rows={8}
              placeholder="Write your announcement here..."
              className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none transition focus:border-black"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {message.length}/5000
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/admin/notifications"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send to All Customers"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}