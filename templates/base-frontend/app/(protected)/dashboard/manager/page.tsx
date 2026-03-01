"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
      Manager
    </span>
  );
}

export default function ManagerDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "manager") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Manager dashboard
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Coordinate your team and keep an eye on recent activity.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Name
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {user.name}
              </span>

              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {user.email}
              </span>

              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Role
              </span>
              <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <RoleBadge role={user.role} />
              </span>

              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Joined
              </span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/posts"
                className="flex-1 rounded-lg bg-zinc-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                View posts
              </Link>
              <button
                onClick={logout}
                className="flex-1 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

