"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/usePosts";

export default function NewPostPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const createPost = useCreatePost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createPost.mutateAsync({ title, body });
      router.push("/posts");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to create post");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <Link
            href="/posts"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to posts
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            New post
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Write a new post
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="body"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Body
            </label>
            <textarea
              id="body"
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-transparent px-4 py-2.5 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 resize-y"
              placeholder="Write your post..."
            />
          </div>

          <button
            type="submit"
            disabled={createPost.isPending}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {createPost.isPending ? "Creating..." : "Create post"}
          </button>
        </form>
      </div>
    </div>
  );
}
