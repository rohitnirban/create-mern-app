"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/hooks/usePosts";

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: posts, isLoading, isError, error } = usePosts();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Posts
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {user?.name}, here are all posts
            </p>
          </div>
          <Link
            href="/posts/new"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New post
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <p className="text-center text-zinc-500 py-8">Loading posts...</p>
          )}
          {isError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {(error as { message?: string })?.message ?? "Failed to load posts"}
            </div>
          )}
          {posts?.length === 0 && !isLoading && (
            <p className="text-center text-zinc-500 py-8">No posts yet. Create one!</p>
          )}
          {posts && posts.length > 0 && (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li
                  key={post._id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {post.body}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/dashboard"
          className="inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
