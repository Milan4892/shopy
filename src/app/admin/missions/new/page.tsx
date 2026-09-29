"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMissionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [target, setTarget] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/missions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          reward,
          target,
          isActive,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Failed to create mission.");
        return;
      }

      router.push(`/admin/missions/${data.mission.id}`);
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Create Mission
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new customer mission and reward.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/missions"
            className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Missions
          </Link>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="text-sm font-medium text-gray-700">
            Mission Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Purchase your first e-bike"
            required
            className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what the customer needs to do."
            rows={4}
            className="mt-2 w-full rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-lime-400"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Reward
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={reward}
              onChange={(event) => setReward(event.target.value)}
              placeholder="500"
              required
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Target
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-lime-400"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-lime-500"
          />

          <span className="text-sm font-medium text-gray-700">
            Make mission active immediately
          </span>
        </label>

        {message && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-lime-400 px-6 text-sm font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Creating..." : "Create Mission"}
        </button>
      </form>
    </div>
  );
}