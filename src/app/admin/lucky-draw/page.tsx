"use client";

import { useEffect, useMemo, useState } from "react";
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
    status: string;
  };
};

function formatMoney(value: string | number | null) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function fullName(user: LuckyDraw["user"]) {
  return `${user.firstName} ${user.lastName}`.trim();
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

export default function AdminLuckyDrawPage() {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [search, setSearch] = useState("");
  const [rewardFilter, setRewardFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDraws() {
      try {
        const response = await fetch(
          "/api/admin/lucky-draw"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load lucky draw records."
          );
        }

        setDraws(data.luckyDraws);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load lucky draw records."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDraws();
  }, []);

  const rewardTypes = useMemo(() => {
    return Array.from(
      new Set(draws.map((draw) => draw.rewardType))
    );
  }, [draws]);

  const filteredDraws = useMemo(() => {
    const query = search.toLowerCase().trim();

    return draws.filter((draw) => {
      const matchesSearch =
        !query ||
        fullName(draw.user)
          .toLowerCase()
          .includes(query) ||
        draw.user.email.toLowerCase().includes(query) ||
        draw.rewardType.toLowerCase().includes(query);

      const matchesReward =
        rewardFilter === "ALL" ||
        draw.rewardType === rewardFilter;

      return matchesSearch && matchesReward;
    });
  }, [draws, search, rewardFilter]);

  const totalRewards = draws.reduce((total, draw) => {
    const value = Number(draw.rewardValue);

    return total + (Number.isFinite(value) ? value : 0);
  }, 0);

  const cashRewards = draws.filter(
    (draw) =>
      draw.rewardType.toLowerCase().includes("cash") ||
      draw.rewardType.toLowerCase().includes("money")
  ).length;

  const uniquePlayers = new Set(
    draws.map((draw) => draw.user.id)
  ).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Lucky Draw
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor customer lucky draw activity and rewards.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Spins
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {draws.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Unique Players
          </p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {uniquePlayers}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Cash Rewards
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {cashRewards}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Reward Value
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(totalRewards)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Lucky Draw Records
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Every lucky draw spin recorded on Shopy.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customer or reward..."
              className="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-lime-400 sm:w-72"
            />

            <select
              value={rewardFilter}
              onChange={(event) =>
                setRewardFilter(event.target.value)
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-lime-400"
            >
              <option value="ALL">All Rewards</option>

              {rewardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading lucky draw records...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-red-600">
              {error}
            </p>
          </div>
        ) : filteredDraws.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">
              No lucky draw records found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Lucky draw activity will appear here when
              customers start spinning.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">
                    Customer
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Email
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Reward Type
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Reward Value
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Spin Date
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDraws.map((draw) => (
                  <tr
                    key={draw.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${draw.user.id}`}
                        className="font-medium text-black hover:underline"
                      >
                        {fullName(draw.user)}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {draw.user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-700">
                        {draw.rewardType}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-black">
                      {draw.rewardValue === null
                        ? "—"
                        : formatMoney(draw.rewardValue)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                          draw.user.status
                        )}`}
                      >
                        {draw.user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(
                        draw.spunAt
                      ).toLocaleDateString("en-NG")}
                    </td>

                    <td className="px-5 py-4">
  <div className="flex gap-2">
    <Link
      href={`/admin/lucky-draw/${draw.id}`}
      className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
    >
      View Draw
    </Link>

    <Link
      href={`/admin/users/${draw.user.id}`}
      className="inline-flex h-9 items-center rounded-lg bg-black px-3 text-sm font-medium text-white transition hover:bg-gray-800"
    >
      View User
    </Link>
  </div>
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