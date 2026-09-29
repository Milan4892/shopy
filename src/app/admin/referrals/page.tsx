"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Referral = {
  id: string;
  createdAt: string;
  referrer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    referralCode: string | null;
  };
  referredUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    status: string;
  };
};

function fullName(user: {
  firstName: string;
  lastName: string;
}) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReferrals() {
      try {
        const response = await fetch("/api/admin/referrals");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load referrals."
          );
        }

        setReferrals(data.referrals);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load referrals."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReferrals();
  }, []);

  const filteredReferrals = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return referrals;
    }

    return referrals.filter((referral) => {
      const referrerName = fullName(referral.referrer).toLowerCase();
      const referredName = fullName(
        referral.referredUser
      ).toLowerCase();

      return (
        referrerName.includes(query) ||
        referredName.includes(query) ||
        referral.referrer.email
          .toLowerCase()
          .includes(query) ||
        referral.referredUser.email
          .toLowerCase()
          .includes(query) ||
        referral.referrer.referralCode
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [referrals, search]);

  const uniqueReferrers = new Set(
    referrals.map((referral) => referral.referrer.id)
  ).size;

  const activeReferredUsers = referrals.filter(
    (referral) => referral.referredUser.status === "ACTIVE"
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Referrals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track customer referrals and referral relationships.
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
            Total Referrals
          </p>
          <p className="mt-2 text-2xl font-bold text-black">
            {referrals.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Active Referrers
          </p>
          <p className="mt-2 text-2xl font-bold text-lime-600">
            {uniqueReferrers}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Active Referred Users
          </p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeReferredUsers}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Inactive Referred Users
          </p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {referrals.length - activeReferredUsers}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Referral Records
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Every customer referral recorded on Shopy.
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, email or code..."
            className="h-10 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-lime-400 sm:w-80"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading referrals...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-red-600">
              {error}
            </p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">
              No referrals found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Referral records will appear here when customers
              refer new users.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">
                    Referrer
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Referral Code
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Referred User
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Email
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Joined
                  </th>
                  <th className="px-5 py-4 font-medium">
                    Referred
                  </th>
                  <th className="px-5 py-4 font-medium">
  Action
</th>
                </tr>
              </thead>

              <tbody>
                {filteredReferrals.map((referral) => (
                  <tr
                    key={referral.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${referral.referrer.id}`}
                        className="font-medium text-black hover:underline"
                      >
                        {fullName(referral.referrer)}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {referral.referrer.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-700">
                        {referral.referrer.referralCode ||
                          "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${referral.referredUser.id}`}
                        className="font-medium text-black hover:underline"
                      >
                        {fullName(referral.referredUser)}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {referral.referredUser.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          referral.referredUser.status ===
                          "ACTIVE"
                            ? "bg-lime-100 text-lime-700"
                            : referral.referredUser.status ===
                              "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {referral.referredUser.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(
                        referral.referredUser.createdAt
                      ).toLocaleDateString("en-NG")}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(
                        referral.createdAt
                      ).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-5 py-4">
  <Link
    href={`/admin/referrals/${referral.id}`}
    className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
  >
    View Referral
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