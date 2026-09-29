"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Mission = {
  id: string;
  title: string;
  description: string | null;
  reward: number;
  target: number;
  progress: number;
  completed: boolean;
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMissions() {
      try {
        const response = await fetch("/api/missions", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load missions.");
          return;
        }

        setMissions(data.missions || []);
      } catch {
        setError("Unable to load missions.");
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-gray-500 hover:text-black"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-black">Missions</h1>

          <p className="mt-2 text-gray-500">
            Complete missions and track your progress.
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-lg shadow-black/5">
            <p className="text-gray-500">Loading missions...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && missions.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-lg shadow-black/5">
            <p className="text-lg font-bold">No missions available</p>
            <p className="mt-2 text-sm text-gray-500">
              Check back later for new missions.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {missions.map((mission) => {
            const progress = Math.min(
              100,
              Math.round((mission.progress / mission.target) * 100)
            );

            const isReferralMission =
              mission.title === "Refer 3 New Users";

            return (
              <div
                key={mission.id}
                className="rounded-3xl bg-white p-6 shadow-lg shadow-black/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-black">
                    {mission.title}
                  </h2>

                  {mission.completed && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      ✓ Completed
                    </span>
                  )}
                </div>

                {mission.description && (
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {mission.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-500">
                    Progress
                  </span>

                  <span className="font-bold">
                    {mission.progress} / {mission.target}
                  </span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {isReferralMission ? (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      Reward
                    </p>

                    <p className="mt-1 text-xl font-black">
                      1 S3 E-Bike FREE
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Refer 3 new users to claim this reward.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-500">
                      Mission Status
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {mission.completed
                        ? "✓ Completed"
                        : "Not completed"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}