"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  _count: {
    userProducts: number;
  };
  userProducts: {
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
  }[];
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    speed: "",
    batteryRange: "",
    stock: "",
    imageUrl: "",
    miningReward: "",
    miningLimitPerDay: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Failed to load product.");
          return;
        }

        const item = data.product as Product;

        setProduct(item);

        setForm({
          sku: item.sku,
          name: item.name,
          description: item.description ?? "",
          price: String(item.price),
          speed: String(item.speed),
          batteryRange: String(item.batteryRange),
          stock: String(item.stock),
          imageUrl: item.imageUrl ?? "",
          miningReward: String(item.miningReward),
          miningLimitPerDay: String(item.miningLimitPerDay),
          isActive: item.isActive,
        });
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          description: form.description,
          price: Number(form.price),
          speed: Number(form.speed),
          batteryRange: Number(form.batteryRange),
          stock: Number(form.stock),
          imageUrl: form.imageUrl,
          miningReward: Number(form.miningReward),
          miningLimitPerDay: Number(form.miningLimitPerDay),
          isActive: form.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update product.");
        return;
      }

      setProduct(data.product);
      setSuccess("E-bike updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 800);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading e-bike...
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-500 hover:text-black"
        >
          ← Back to Products
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          ← Back to Products
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Edit E-Bike
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Update product information, pricing, inventory and mining settings.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
      >
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update the main details of this e-bike.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                SKU
              </label>

              <input
                type="text"
                value={form.sku}
                onChange={(event) =>
                  updateField("sku", event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                E-Bike Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL / Path
            </label>

            <input
              type="text"
              value={form.imageUrl}
              onChange={(event) =>
                updateField("imageUrl", event.target.value)
              }
              placeholder="/bikes/s10.jpeg"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
            />
          </div>
        </section>

        <section className="space-y-5 border-t border-gray-100 pt-8">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Performance & Pricing
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update the e-bike specifications and marketplace price.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price (₦)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  updateField("price", event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Speed (km/h)
              </label>

              <input
                type="number"
                min="0"
                value={form.speed}
                onChange={(event) =>
                  updateField("speed", event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Battery Range (km)
              </label>

              <input
                type="number"
                min="0"
                value={form.batteryRange}
                onChange={(event) =>
                  updateField(
                    "batteryRange",
                    event.target.value
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>
          </div>
        </section>

        <section className="space-y-5 border-t border-gray-100 pt-8">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Inventory & Mining
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Update stock and mining configuration.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  updateField("stock", event.target.value)
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mining Reward (₦)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.miningReward}
                onChange={(event) =>
                  updateField(
                    "miningReward",
                    event.target.value
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Daily Mining Limit
              </label>

              <input
                type="number"
                min="0"
                value={form.miningLimitPerDay}
                onChange={(event) =>
                  updateField(
                    "miningLimitPerDay",
                    event.target.value
                  )
                }
                required
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-black outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 pt-8">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="h-5 w-5 rounded border-gray-300 text-lime-500 focus:ring-lime-400"
            />

            <span>
              <span className="block text-sm font-medium text-black">
                Active product
              </span>

              <span className="block text-xs text-gray-400">
                Active e-bikes can appear in the marketplace.
              </span>
            </span>
          </label>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-700">
            {success}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-black"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      <section className="space-y-5 border-t border-gray-100 pt-8">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold text-black">
        Ownership & Purchase Information
      </h2>

      <p className="mt-1 text-sm text-gray-400">
        Customers who currently own or previously acquired this e-bike.
      </p>
    </div>

    <div className="rounded-xl bg-lime-50 px-4 py-2">
      <span className="text-xs font-medium text-gray-500">
        Total Owners
      </span>
      <span className="ml-2 text-sm font-bold text-lime-700">
        {product?._count.userProducts ?? 0}
      </span>
    </div>
  </div>

  {!product?.userProducts?.length ? (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="font-medium text-black">
        No ownership records yet.
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Customers who purchase this e-bike will appear here.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Customer
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
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {product.userProducts.map((ownership) => (
            <tr
              key={ownership.id}
              className="transition hover:bg-gray-50"
            >
              <td className="px-5 py-5">
                <p className="font-medium text-black">
                  {ownership.user.firstName ||
                  ownership.user.lastName
                    ? `${ownership.user.firstName ?? ""} ${
                        ownership.user.lastName ?? ""
                      }`.trim()
                    : "Customer"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {ownership.user.email}
                </p>
              </td>

              <td className="px-5 py-5">
                <p className="font-semibold text-black">
                  ₦
                  {Number(
                    ownership.purchasePrice
                  ).toLocaleString()}
                </p>
              </td>

              <td className="px-5 py-5">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    ownership.status === "ACTIVE"
                      ? "bg-lime-100 text-lime-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ownership.status}
                </span>
              </td>

              <td className="px-5 py-5">
                <p className="text-sm text-gray-600">
                  {new Date(
                    ownership.acquiredAt
                  ).toLocaleDateString()}
                </p>
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