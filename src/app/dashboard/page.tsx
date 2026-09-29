
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Bike = {
  id: string;
  status: string;
  purchasePrice: string;
  acquiredAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
    imageUrl: string | null;
    miningReward: string;
    miningLimitPerDay: number;
  };
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  wallet: {
    balance: string;
  };
  currentBike: Bike | null;
  roles: string[];
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const bikes = [
  {
    image: "/bikes/s1.jpeg",
    title: "Premium Electric Bikes",
  },
  {
    image: "/bikes/s2.jpeg",
    title: "Ride Smarter",
  },
  {
    image: "/bikes/s3.jpeg",
    title: "Built For The Journey",
  },
  {
    image: "/bikes/s4.jpeg",
    title: "Power Meets Style",
  },
  {
    image: "/bikes/s5.jpeg",
    title: "Power Meets Style",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [welcomeNotification, setWelcomeNotification] =
    useState<Notification | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [markingNotification, setMarkingNotification] = useState(false);

  useEffect(() => {
    async function getUser() {
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

    getUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) =>
        current === bikes.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) return;

        const userNotifications = data.notifications ?? [];

        setNotifications(userNotifications);

        const latestUnread = userNotifications.find(
          (notification: Notification) => !notification.isRead
        );

        if (latestUnread) {
          setWelcomeNotification(latestUnread);
        }
      } catch (error) {
        console.error("Notification fetch error:", error);
      }
    }

    if (user) {
      getNotifications();
    }
  }, [user]);

  async function markNotificationAsRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      if (welcomeNotification?.id === id) {
        setWelcomeNotification(null);
      }
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  }

  async function dismissWelcomeNotification() {
    if (!welcomeNotification) return;

    try {
      setMarkingNotification(true);

      await markNotificationAsRead(welcomeNotification.id);
    } finally {
      setMarkingNotification(false);
    }
  }

  async function markAllNotificationsAsRead() {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    );

    if (unreadNotifications.length === 0) return;

    try {
      setMarkingNotification(true);

      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch(`/api/notifications/${notification.id}`, {
            method: "PATCH",
            credentials: "include",
          })
        )
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setWelcomeNotification(null);
    } catch (error) {
      console.error("Mark all notifications error:", error);
    } finally {
      setMarkingNotification(false);
    }
  }

  function formatNotificationDate(date: string) {
    const notificationDate = new Date(date);

    return notificationDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3ea]">
        <p className="text-sm font-medium text-gray-500">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  const balance = Number(user?.wallet?.balance ?? 0);
  const currentBike = user?.currentBike;
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const accountType =
    user?.roles?.includes("CUSTOMER") && user.roles.length === 1
      ? "CUSTOMER"
      : user?.roles?.join(", ");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3ea] text-[#111713]">
      {welcomeNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-xl">
                📢
              </div>

              <button
                type="button"
                onClick={dismissWelcomeNotification}
                disabled={markingNotification}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-black disabled:opacity-50"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-green-600">
              {welcomeNotification.type}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#111713]">
              {welcomeNotification.title}
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {welcomeNotification.message}
            </p>

            <button
              type="button"
              onClick={dismissWelcomeNotification}
              disabled={markingNotification}
              className="mt-7 w-full rounded-xl bg-[#111713] px-5 py-3 text-sm font-bold text-white transition hover:bg-lime-400 hover:text-[#111713] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingNotification ? "Please wait..." : "Got it"}
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-lime-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-green-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-1/3 h-96 w-96 rounded-full bg-lime-100/50 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#eef3ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-black">
            Shoppy
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen((open) => !open)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#111713]/10 bg-white/80 text-xl transition hover:bg-white"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                    <div>
                      <h3 className="font-black text-[#111713]">
                        Notifications
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${
                              unreadCount === 1 ? "" : "s"
                            }`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        disabled={markingNotification}
                        className="text-xs font-bold text-green-700 transition hover:text-black disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <div className="text-3xl">🔔</div>
                        <p className="mt-3 text-sm font-bold text-gray-700">
                          No notifications
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          New updates will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            !notification.isRead &&
                            markNotificationAsRead(notification.id)
                          }
                          className={`block w-full border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-gray-50 ${
                            !notification.isRead ? "bg-lime-50/70" : "bg-white"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                                notification.isRead
                                  ? "bg-gray-200"
                                  : "bg-lime-500"
                              }`}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p
                                  className={`text-sm ${
                                    notification.isRead
                                      ? "font-semibold text-gray-700"
                                      : "font-black text-[#111713]"
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                <span className="shrink-0 text-[10px] font-medium text-gray-400">
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                {notification.message}
                              </p>

                              <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-gray-500">
                                {notification.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {notifications.length > 10 && (
                    <div className="border-t border-gray-100 p-3">
                      <p className="text-center text-xs font-medium text-gray-400">
                        Showing your latest 10 notifications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/products"
              className="rounded-xl bg-[#111713] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-lime-400 hover:text-[#111713]"
            >
              Marketplace
            </Link>

            <Link
              href="/account"
              className="rounded-xl border border-[#111713] px-4 py-2 text-sm font-bold text-[#111713] transition hover:bg-[#111713] hover:text-white"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-8">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">Welcome back</p>

            <h1 className="mt-1 text-4xl font-black sm:text-5xl">
              {user?.firstName}
            </h1>

            <p className="mt-2 break-all text-sm text-gray-500">
              Account ID:{" "}
              <span className="font-semibold text-[#111713]">
                {user?.id}
              </span>
            </p>
          </div>

          <div className="w-fit rounded-full bg-lime-400 px-4 py-2 text-xs font-black shadow-sm">
            {accountType}
          </div>
        </section>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#111713] shadow-2xl shadow-black/10">
          <div className="relative h-[210px] sm:h-[260px]">
            <Image
              src={bikes[currentSlide].image}
              alt={bikes[currentSlide].title}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 1000px"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />

            <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400">
                Shoppy Marketplace
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                {bikes[currentSlide].title}
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/75">
                Discover your next electric ride.
              </p>

              <Link
                href="/products"
                className="mt-4 inline-flex w-fit rounded-xl bg-lime-400 px-4 py-2 text-xs font-black text-[#111713] transition hover:bg-lime-300"
              >
                Explore Bikes
              </Link>
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentSlide((current) =>
                  current === 0 ? bikes.length - 1 : current - 1
                )
              }
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-lg text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              aria-label="Previous bike"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentSlide((current) =>
                  current === bikes.length - 1 ? 0 : current + 1
                )
              }
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-lg text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              aria-label="Next bike"
            >
              ›
            </button>

            <div className="absolute bottom-4 right-5 flex gap-1.5">
              {bikes.map((bike, index) => (
                <button
                  key={bike.image}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentSlide === index
                      ? "w-6 bg-lime-400"
                      : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-[#111713] p-7 text-white shadow-xl shadow-black/10">
            <p className="text-sm font-medium text-white/60">
              Available Balance
            </p>

            <h2 className="mt-3 text-4xl font-black">
              ₦
              {balance.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <Link
              href="/wallet"
              className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-[#111713] transition hover:bg-lime-300"
            >
              Open Wallet
            </Link>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-lg shadow-black/5 backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Status
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  user?.status === "ACTIVE"
                    ? "bg-green-500"
                    : user?.status === "SUSPENDED"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />

              <span className="text-2xl font-black">{user?.status}</span>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Your Shoppy account is currently{" "}
              {user?.status?.toLowerCase()}.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-lg shadow-black/5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Plan
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {currentBike ? currentBike.product.sku : "No Active Plan"}
                </h2>
              </div>

              <div className="rounded-full bg-lime-100 px-3 py-2 text-xs font-black text-green-700">
                {currentBike ? "ACTIVE" : "NONE"}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {currentBike
                ? "Your active bike is currently linked to this plan."
                : "Acquire a bike to activate your first plan."}
            </p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-lg shadow-black/5 backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-500">Current Bike</p>

            {currentBike ? (
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-20 w-24 overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={
                      currentBike.product.imageUrl ||
                      "/bikes/shopy%20bike.png"
                    }
                    alt={currentBike.product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">
                    {currentBike.product.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {currentBike.product.sku}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    ₦
                    {Number(currentBike.purchasePrice).toLocaleString(
                      "en-NG"
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-lg font-bold">No bike acquired yet</p>

                <p className="mt-1 text-sm text-gray-500">
                  Your active bike will appear here.
                </p>

                <Link
                  href="/products"
                  className="mt-4 inline-flex rounded-xl bg-lime-400 px-4 py-2 text-sm font-bold text-[#111713] transition hover:bg-lime-300"
                >
                  Acquire a Bike
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Quick Actions</h2>

            <span className="text-xs font-semibold text-gray-400">
              Manage your account
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <DashboardButton
              href="/mining"
              title="Mining"
              description="Start mining"
              primary
            />

            <DashboardButton
              href="/products"
              title="Acquire Bike"
              description="Browse bikes"
            />

            <DashboardButton
              href="/my-bikes"
              title="My Bikes"
              description="View your bikes"
            />

            <DashboardButton
              href="/wallet"
              title="Wallet"
              description="Manage balance"
            />

            <DashboardButton
              href="/missions"
              title="Missions"
              description="View missions"
            />

            <DashboardButton
              href="/referrals"
              title="Referrals"
              description="Invite & earn"
            />

            <DashboardButton
              href="/lucky-draw"
              title="Lucky Draw"
              description="Try your luck"
            />

            <DashboardButton
              href="/vip"
              title="VIP"
              description="View VIP benefits"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardButton({
  href,
  title,
  description,
  primary = false,
}: {
  href: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border border-white/60 p-5 transition duration-200 hover:-translate-y-1 ${
        primary
          ? "bg-lime-400 shadow-md shadow-lime-900/10 hover:bg-lime-300"
          : "bg-white/90 shadow-md shadow-black/5 hover:shadow-lg"
      }`}
    >
      <h3 className="font-black">{title}</h3>

      <p
        className={`mt-1 text-xs ${
          primary ? "text-[#111713]/60" : "text-gray-500"
        }`}
      >
        {description}
      </p>
    </Link>
  );
}