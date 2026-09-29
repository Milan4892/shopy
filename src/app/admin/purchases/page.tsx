"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Purchase = {
  id: string;
  purchasePrice: string | number;
  status: string;
  acquiredAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  product: {
    id: string;
    sku: string;
    name: string;
    imageUrl: string | null;
    price: string | number;
  };
};

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/purchases", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Failed to load purchases.");
          return;
        }

        setPurchases(data.purchases);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, []);

  const filteredPurchases = useMemo(() => {
    const value = search.trim().toLowerCase();

    return purchases.filter((purchase) => {
      const customerName = `${purchase.user.firstName ?? ""} ${
        purchase.user.lastName ?? ""
      }`
        .trim()
        .toLowerCase();

      const matchesSearch =
        !value ||
        customerName.includes(value) ||
        purchase.user.email.toLowerCase().includes(value) ||
        purchase.product.name.toLowerCase().includes(value) ||
        purchase.product.sku.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        purchase.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, statusFilter]);

  const totalPurchases = purchases.length;

  const activePurchases = purchases.filter(
    (purchase) => purchase.status === "ACTIVE"
  ).length;

  const totalValue = purchases.reduce(
    (total, purchase) =>
      total + Number(purchase.purchasePrice),
    0
  );

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Purchases
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor customer e-bike purchases and ownership records.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
        >
          ← Dashboard
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {totalPurchases}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Ownerships</p>
          <p className="mt-2 text-3xl font-bold text-lime-600">
            {activePurchases}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Purchase Value
          </p>
          <p className="mt-2 text-3xl font-bold text-black">
            ₦{totalValue.toLocaleString()}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-black">
                Purchase Records
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {filteredPurchases.length} purchase
                {filteredPurchases.length === 1 ? "" : "s"} displayed
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customer or e-bike..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100 sm:w-72"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading purchases...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">
              No purchases found.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Purchase records will appear here when customers
              acquire e-bikes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    E-Bike
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Purchase Price
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Acquired
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Customer
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.map((purchase) => {
                  const customerName =
                    `${purchase.user.firstName ?? ""} ${
                      purchase.user.lastName ?? ""
                    }`.trim() || "Customer";

                  return (
                    <tr
                      key={purchase.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-black">
                          {customerName}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {purchase.user.email}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {purchase.product.imageUrl ? (
                              <img
                                src={purchase.product.imageUrl}
                                alt={purchase.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-black">
                              {purchase.product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              SKU: {purchase.product.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-semibold text-black">
                          ₦
                          {Number(
                            purchase.purchasePrice
                          ).toLocaleString()}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            purchase.status === "ACTIVE"
                              ? "bg-lime-100 text-lime-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm text-gray-600">
                          {new Date(
                            purchase.acquiredAt
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/users/${purchase.user.id}`}
                          className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-white hover:text-black"
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
      </section>
    </main>
  );
}