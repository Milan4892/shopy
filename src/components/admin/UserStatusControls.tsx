"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  currentStatus: string;
};

export default function UserStatusControls({
  userId,
  currentStatus,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  async function changeStatus(status: string) {
    setLoading(status);
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Unable to update user.");
        return;
      }

      setMessage(data.message);
      router.refresh();
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        {currentStatus !== "SUSPENDED" && (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => changeStatus("SUSPENDED")}
            className="rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "SUSPENDED"
              ? "Suspending..."
              : "Suspend User"}
          </button>
        )}

        {currentStatus !== "DEACTIVATED" && (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => changeStatus("DEACTIVATED")}
            className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "DEACTIVATED"
              ? "Deactivating..."
              : "Deactivate User"}
          </button>
        )}

        {currentStatus !== "ACTIVE" && (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => changeStatus("ACTIVE")}
            className="rounded-xl bg-lime-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "ACTIVE"
              ? "Reactivating..."
              : "Reactivate User"}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}