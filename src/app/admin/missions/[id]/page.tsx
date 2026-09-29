"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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

export default function AdminMissionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [mission, setMission] = useState<Mission | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [target, setTarget] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMission() {
      try {
        const response = await fetch(`/api/admin/missions/${id}`);
        const data = await response.json();

        if (!data.success) {
          setMessage(data.message || "Failed to load mission.");
          return;
        }

        const item = data.mission;

        setMission(item);
        setTitle(item.title);
        setDescription(item.description ?? "");
        setReward(String(item.reward));
        setTarget(String(item.target));
        setIsActive(item.isActive);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadMission();
    }
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/missions/${id}`, {
        method: "PATCH",
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
        setMessage(data.message || "Failed to update mission.");
        return;
      }

      setMission(data.mission);
      setTitle(data.mission.title);
      setDescription(data.mission.description ?? "");
      setReward(String(data.mission.reward));
      setTarget(String(data.mission.target));
      setIsActive(data.mission.isActive);
      setMessage("Mission updated successfully.");
      router.refresh();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading mission...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-black">
          Mission Not Found
        </h1>
        <p className="text-sm text-gray-500">{message}</p>
        <Link
          href="/admin/missions"
          className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Missions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Mission Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit mission information and reward settings.
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Completions</p>
          <p className="mt-2 text-2xl font-bold text-black">
            {mission._count.completions}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Created</p>
          <p className="mt-2 font-semibold text-black">
            {new Date(mission.createdAt).toLocaleDateString("en-NG")}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Status</p>
          <p
            className={`mt-2 font-semibold ${
              mission.isActive
                ? "text-lime-600"
                : "text-gray-500"
            }`}
          >
            {mission.isActive ? "ACTIVE" : "INACTIVE"}
          </p>
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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
            Mission is active
          </span>
        </label>

        {message && (
          <div className="rounded-xl bg-lime-50 px-4 py-3 text-sm text-lime-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-xl bg-lime-400 px-6 text-sm font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}