"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load notifications.");
          return;
        }

        setNotifications(data.notifications || []);
      } catch {
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch {
      return;
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter(
      (notification) => !notification.isRead
    );

    await Promise.all(unread.map((notification) => markAsRead(notification.id)));
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-gray-500 hover:text-black"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Notifications</h1>

            <p className="mt-2 text-gray-500">
              Stay updated with activity on your Shoppy account.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg shadow-black/5">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-lg shadow-black/5">
            <div className="text-4xl">🔔</div>

            <p className="mt-4 text-lg font-bold">No notifications yet</p>

            <p className="mt-2 text-sm text-gray-500">
              Important account updates will appear here.
            </p>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div className="mt-8 space-y-3">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  !notification.isRead && markAsRead(notification.id)
                }
                className={`w-full rounded-3xl p-5 text-left shadow-lg shadow-black/5 transition ${
                  notification.isRead
                    ? "bg-white"
                    : "border border-black/10 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                      notification.isRead ? "bg-gray-200" : "bg-black"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-bold">{notification.title}</h2>

                      {!notification.isRead && (
                        <span className="shrink-0 text-xs font-bold text-black">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}