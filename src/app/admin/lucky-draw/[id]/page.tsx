"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type LuckyDraw = {
  id: string;
  rewardType: string;
  rewardValue: string | number | null;
  spunAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
    referralCode: string | null;
    createdAt: string;
  };
};

function formatMoney(value: string | number | null) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClass(status: string) {
  if (status === "ACTIVE") {
    return "bg-lime-100 text-lime-700";
  }

  if (status === "SUSPENDED") {
    return "bg-yellow-100 text-yellow-700";
  }

  return "bg-red-100 text-red-700";
}

export default function AdminLuckyDrawDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [draw, setDraw] = useState<LuckyDraw | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDraw() {
      try {
        const response = await fetch(
          `/api/admin/lucky-draw/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load lucky draw record."
          );
        }

        setDraw(data.luckyDraw);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load lucky draw record."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadDraw();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading lucky draw...
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/lucky-draw"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Lucky Draw
        </Link>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
          <p className="font-medium text-red-700">
            {error || "Lucky draw record not found."}
          </p>
        </div>
      </div>
    );
  }

  const customerName =
    `${draw.user.firstName} ${draw.user.lastName}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/lucky-draw"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Lucky Draw
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-black">
            Lucky Draw Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the details of this lucky draw spin.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-black">
              Reward
            </h2>

            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
              {draw.rewardType}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Reward Type
              </p>
              <p className="mt-1 text-lg font-bold text-black">
                {draw.rewardType}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Reward Value
              </p>
              <p className="mt-1 text-2xl font-bold text-lime-600">
                {draw.rewardValue === null
                  ? "No monetary value"
                  : formatMoney(draw.rewardValue)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Spin Date
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {formatDateTime(draw.spunAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-black">
              Customer
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                draw.user.status
              )}`}
            >
              {draw.user.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Name
              </p>
              <p className="mt-1 font-semibold text-black">
                {customerName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {draw.user.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {draw.user.phone}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Referral Code
              </p>
              <p className="mt-1 text-sm font-semibold text-lime-700">
                {draw.user.referralCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Customer Since
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(draw.user.createdAt)}
              </p>
            </div>

            <Link
              href={`/admin/users/${draw.user.id}`}
              className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View Customer
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-black">
          Draw Information
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Draw ID
            </p>
            <p className="mt-1 break-all text-sm font-medium text-black">
              {draw.id}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Spin Timestamp
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {formatDateTime(draw.spunAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}