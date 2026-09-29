"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MiningRecord = {
  id: string;
  amount: unknown;
  minedAt: string;
  dateKey: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  userProduct: {
    id: string;
    product: {
      id: string;
      sku: string;
      name: string;
      miningReward: unknown;
      miningLimitPerDay: number;
    };
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

export default function AdminMiningPage() {
  const [records, setRecords] = useState<MiningRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMining() {
      try {
        const response = await fetch("/api/admin/mining");
        const data = await response.json();

        if (data.success) {
          setRecords(data.miningRecords);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMining();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter((record) => {
      const fullName =
        `${record.user.firstName ?? ""} ${record.user.lastName ?? ""}`.trim();

      return (
        !query ||
        fullName.toLowerCase().includes(query) ||
        record.user.email.toLowerCase().includes(query) ||
        record.userProduct.product.name.toLowerCase().includes(query) ||
        record.userProduct.product.sku.toLowerCase().includes(query) ||
        record.dateKey.toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const totalReward = records.reduce(
    (total, record) => total + Number(record.amount),
    0
  );

  const today = new Date().toISOString().slice(0, 10);

  const todayRecords = records.filter(
    (record) => record.dateKey === today
  );

  const todayReward = todayRecords.reduce(
    (total, record) => total + Number(record.amount),
    0
  );

  const uniqueMiners = new Set(
    records.map((record) => record.user.id)
  ).size;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Mining</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor customer mining activity and rewards.
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
          <p className="text-sm text-gray-500">Mining Records</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {records.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Unique Miners</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {uniqueMiners}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Today's Rewards</p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {formatMoney(todayReward)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Rewards</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {formatMoney(totalReward)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Mining Activity
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              All customer mining records.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, bike or date..."
            className="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400 sm:w-80"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading mining activity...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-black">
              No mining records found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Customer mining activity will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">E-Bike</th>
                  <th className="px-5 py-4 font-medium">Reward</th>
                  <th className="px-5 py-4 font-medium">Daily Limit</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Time</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const fullName =
                    `${record.user.firstName ?? ""} ${record.user.lastName ?? ""}`.trim();

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {fullName || "Unnamed Customer"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-black">
                          {record.userProduct.product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.userProduct.product.sku}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-lime-600">
                        {formatMoney(record.amount)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.userProduct.product.miningLimitPerDay}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(record.minedAt).toLocaleDateString("en-NG")}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(record.minedAt).toLocaleTimeString("en-NG")}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${record.user.id}`}
                          className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
                        >
                          View User
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}