"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type Stats = {
  total: number;
  unread: number;
  read: number;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unread: 0,
    read: 0,
  });
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (readFilter !== "all") params.set("read", readFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const response = await fetch(
        `/api/admin/notifications?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      setNotifications(data.notifications);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [readFilter, typeFilter]);

  const filteredNotifications = useMemo(() => {
    if (!search.trim()) return notifications;

    const value = search.toLowerCase();

    return notifications.filter((notification) =>
      [
        notification.title,
        notification.message,
        notification.type,
        notification.user.firstName,
        notification.user.lastName,
        notification.user.email,
      ].some((field) => field.toLowerCase().includes(value))
    );
  }, [notifications, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer notifications and announcements.
          </p>
        </div>

        <Link
          href="/admin/notifications/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + New Announcement
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Notifications</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unread</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">
            {stats.unread}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Read</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">
            {stats.read}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadNotifications();
              }
            }}
            placeholder="Search notifications..."
            className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
          />

          <select
            value={readFilter}
            onChange={(event) => setReadFilter(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-black"
          >
            <option value="all">All Types</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="WELCOME">Welcome</option>
            <option value="SYSTEM">System</option>
            <option value="PROMOTION">Promotion</option>
            <option value="GENERAL">General</option>
          </select>

          <button
            type="button"
            onClick={loadNotifications}
            className="h-10 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No notifications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Notification
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-950">
                        {notification.user.firstName}{" "}
                        {notification.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.user.email}
                      </p>
                    </td>

                    <td className="max-w-[320px] px-5 py-4">
                      <p className="truncate font-medium text-gray-950">
                        {notification.title}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {notification.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          notification.isRead
                            ? "bg-gray-100 text-gray-600"
                            : "bg-black text-white"
                        }`}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {new Date(notification.createdAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/notifications/${notification.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}