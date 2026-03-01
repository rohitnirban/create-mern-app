"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useAuth } from "@/context/AuthContext";
import { usePostsAdmin } from "@/features/posts/hooks";
import { PaginatedDataTable } from "@/components/data-table";
import type { Post, UserRole } from "@/types";

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
      Admin
    </span>
  );
}

const postColumns: ColumnDef<Post>[] = [
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {String(row.original._id).slice(-8)}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.original.title}>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "body",
    header: "Body",
    cell: ({ row }) => (
      <span
        className="block max-w-[280px] truncate text-zinc-600 dark:text-zinc-400"
        title={row.original.body}
      >
        {row.original.body}
      </span>
    ),
  },
  {
    id: "author",
    header: "Author",
    cell: ({ row }) => row.original.author?.name ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(undefined, {
        dateStyle: "short",
      }),
  },
];

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { data, isLoading, isError, error, refetch } = usePostsAdmin({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            You are signed in as an administrator. Monitor activity across the app.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Name</span>
              <span className="text-zinc-900 dark:text-zinc-100">{user.name}</span>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Email</span>
              <span className="text-zinc-900 dark:text-zinc-100">{user.email}</span>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Role</span>
              <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <RoleBadge role={user.role} />
              </span>
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Joined</span>
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

        <PaginatedDataTable<Post>
          columns={postColumns}
          data={data?.items ?? []}
          pagination={data?.pagination}
          paginationState={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          isError={isError}
          errorMessage={(error as { message?: string })?.message ?? "Failed to load posts"}
          emptyMessage="No posts yet."
          itemLabel="posts"
          title="Posts"
          headerActions={
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Refresh
            </button>
          }
        />
      </div>
    </div>
  );
}
