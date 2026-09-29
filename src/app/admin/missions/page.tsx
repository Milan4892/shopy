"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Mission = {
  id: string;
  title: string;
  description: string | null;
  reward: unknown;
  target: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    completions: number;
  };
};

function formatMoney(value: unknown) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      try {
        const response = await fetch("/api/admin/missions");
        const data = await response.json();

        if (data.success) {
          setMissions(data.missions);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, []);

  const filteredMissions = useMemo(() => {
    const query = search.toLowerCase().trim();

    return missions.filter((mission) => {
      const matchesSearch =
        !query ||
        mission.title.toLowerCase().includes(query) ||
        mission.description?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && mission.isActive) ||
        (statusFilter === "INACTIVE" && !mission.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [missions, search, statusFilter]);

  const activeMissions = missions.filter(
    (mission) => mission.isActive
  ).length;

  const inactiveMissions = missions.filter(
    (mission) => !mission.isActive
  ).length;

  const totalRewards = missions.reduce(
    (total, mission) => total + Number(mission.reward),
    0
  );

  const totalCompletions = missions.reduce(
    (total, mission) => total + mission._count.completions,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Missions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer missions and reward activities.
          </p>
        </div>
  <Link
    href="/admin/missions/new"
    className="inline-flex h-10 items-center justify-center rounded-xl bg-lime-400 px-4 text-sm font-bold text-black transition hover:bg-lime-300"
  >
    + New Mission
  </Link>

  <Link
    href="/admin"
    className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
  >
    ← Dashboard
  </Link>
</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Missions</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {missions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Missions</p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {activeMissions}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completions</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {totalCompletions}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Rewards</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(totalRewards)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Mission Management
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              View customer missions and their completion activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search missions..."
              className="h-10 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-lime-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading missions...
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-black">
              No missions found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Missions will appear here when available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">Mission</th>
                  <th className="px-5 py-4 font-medium">Reward</th>
                  <th className="px-5 py-4 font-medium">Target</th>
                  <th className="px-5 py-4 font-medium">Completions</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredMissions.map((mission) => (
                  <tr
                    key={mission.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-black">
                        {mission.title}
                      </p>
                      {mission.description && (
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                          {mission.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-lime-600">
                      {formatMoney(mission.reward)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {mission.target}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {mission._count.completions}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          mission.isActive
                            ? "bg-lime-100 text-lime-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {mission.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(
                        mission.createdAt
                      ).toLocaleDateString("en-NG")}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/missions/${mission.id}`}
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