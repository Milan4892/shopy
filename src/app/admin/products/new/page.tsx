"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    speed: "",
    batteryRange: "",
    stock: "0",
    imageUrl: "",
    miningReward: "",
    miningLimitPerDay: "2",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
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
        setError(data.message || "Failed to create product.");
        return;
      }

      setSuccess("E-bike created successfully.");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 800);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
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

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-black">
          Add E-Bike
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Create a new e-bike product for the Shopy marketplace.
        </p>
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
              Enter the main details of the e-bike.
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
                placeholder="S10"
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
                placeholder="Shopy X10"
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
              placeholder="Describe the e-bike..."
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
            <p className="mt-2 text-xs text-gray-400">
              Example: /bikes/s10.jpeg
            </p>
          </div>
        </section>

        <section className="space-y-5 border-t border-gray-100 pt-8">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Performance & Pricing
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Set the marketplace specifications.
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
                placeholder="500000"
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
                placeholder="45"
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
                  updateField("batteryRange", event.target.value)
                }
                placeholder="80"
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
              Configure stock and mining rewards.
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
                  updateField("miningReward", event.target.value)
                }
                placeholder="1000"
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
                Make this e-bike immediately available in the marketplace.
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
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create E-Bike"}
          </button>
        </div>
      </form>
    </main>
  );
}