"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type ReferredUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode: string | null;
  status: string;
  createdAt: string;
  referredUsers: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    createdAt: string;
  }[];
};

type Referral = {
  id: string;
  createdAt: string;
  referrer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    referralCode: string | null;
    status: string;
    createdAt: string;
  };
  referredUser: ReferredUser;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

export default function AdminReferralDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [referral, setReferral] = useState<Referral | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReferral() {
      try {
        const response = await fetch(
          `/api/admin/referrals/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load referral."
          );
        }

        setReferral(data.referral);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load referral."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadReferral();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading referral...
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/referrals"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Referrals
        </Link>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
          <p className="font-medium text-red-700">
            {error || "Referral not found."}
          </p>
        </div>
      </div>
    );
  }

  const referrerName =
    `${referral.referrer.firstName} ${referral.referrer.lastName}`.trim();

  const referredName =
    `${referral.referredUser.firstName} ${referral.referredUser.lastName}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/referrals"
            className="text-sm font-medium text-gray-500 hover:text-black"
          >
            ← Referrals
          </Link>

          <h1 className="mt-2 text-2xl font-bold text-black">
            Referral Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View the relationship between the referring customer
            and the referred customer.
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
              Referrer
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                referral.referrer.status
              )}`}
            >
              {referral.referrer.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Name
              </p>
              <p className="mt-1 font-semibold text-black">
                {referrerName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {referral.referrer.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {referral.referrer.phone}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Referral Code
              </p>
              <p className="mt-1 font-semibold text-lime-700">
                {referral.referrer.referralCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Customer Since
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(referral.referrer.createdAt)}
              </p>
            </div>

            <Link
              href={`/admin/users/${referral.referrer.id}`}
              className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View Customer
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-black">
              Referred Customer
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                referral.referredUser.status
              )}`}
            >
              {referral.referredUser.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Name
              </p>
              <p className="mt-1 font-semibold text-black">
                {referredName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {referral.referredUser.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {referral.referredUser.phone}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Referral Code
              </p>
              <p className="mt-1 font-semibold text-lime-700">
                {referral.referredUser.referralCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Joined
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(referral.referredUser.createdAt)}
              </p>
            </div>

            <Link
              href={`/admin/users/${referral.referredUser.id}`}
              className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View Customer
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-black">
              Referral Information
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Information about when this referral was recorded.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Referral ID
            </p>
            <p className="mt-1 break-all text-sm font-medium text-black">
              {referral.id}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Referral Date
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {formatDate(referral.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Downline Referrals
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {referral.referredUser.referredUsers.length}
            </p>
          </div>
        </div>
      </div>

      {referral.referredUser.referredUsers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-5">
            <h2 className="font-semibold text-black">
              Referred User&apos;s Referrals
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Customers subsequently referred by this user.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-4 font-medium">
                    Customer
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
                </tr>
              </thead>

              <tbody>
                {referral.referredUser.referredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium text-black hover:underline"
                        >
                          {`${user.firstName} ${user.lastName}`}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}