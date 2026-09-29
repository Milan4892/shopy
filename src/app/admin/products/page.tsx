"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string | number;
  speed: number;
  batteryRange: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  miningLimitPerDay: number;
  miningReward: string | number;
  createdAt: string;
  updatedAt: string;
  _count: {
    userProducts: number;
  };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Failed to load products.");
          return;
        }

        setProducts(data.products);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(value) ||
        product.sku.toLowerCase().includes(value)
    );
  }, [products, search]);

  const totalProducts = products.length;
  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;
  const inactiveProducts = totalProducts - activeProducts;
  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage Shopy e-bikes, pricing, stock and mining settings.
          </p>
        </div>
        <Link
  href="/admin"
  className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
>
  ← Dashboard
</Link>

        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Add E-Bike
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total E-Bikes</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-lime-600">
            {activeProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="mt-2 text-3xl font-bold text-gray-600">
            {inactiveProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {totalStock}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-black">
                E-Bike Inventory
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"} displayed
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or SKU..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100 sm:max-w-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-black">
              No products found.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Add an e-bike or change your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Product
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Price
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Stock
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Mining
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Owners
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-medium text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-black">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            SKU: {product.sku}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {product.speed} km/h ·{" "}
                            {product.batteryRange} km range
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-semibold text-black">
                        ₦{Number(product.price).toLocaleString()}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-medium text-black">
                        {product.stock}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        units
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-medium text-black">
                        ₦
                        {Number(
                          product.miningReward
                        ).toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {product.miningLimitPerDay} daily
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-medium text-black">
                        {product._count.userProducts}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-lime-100 text-lime-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-white hover:text-black"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}