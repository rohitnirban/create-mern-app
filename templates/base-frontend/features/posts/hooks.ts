"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedQuery } from "@/lib/usePaginatedQuery";
import { postsApi } from "@/features/posts/api";
import { queryKeys } from "@/lib/queryKeys";
import type { CreatePostInput } from "@/types";

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => postsApi.getList(),
    staleTime: 60 * 1000,
  });
}

/** Admin: fetch one page of posts (server-side pagination). Uses generic usePaginatedQuery. */
export function usePostsAdmin(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  return usePaginatedQuery(params, {
    queryKeyPrefix: queryKeys.posts.adminListPrefix(),
    queryFn: async (p) => {
      const res = await postsApi.getAdminList(p);
      return { items: res.posts, pagination: res.pagination };
    },
    staleTime: 60 * 1000,
  });
}

export function usePost(id: string | null) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id ?? ""),
    queryFn: () => postsApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

