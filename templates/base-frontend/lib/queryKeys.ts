/**
 * Centralized query keys for React Query.
 * Use these for cache lookups and invalidation.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: ["auth", "me"] as const,
  },
  posts: {
    all: ["posts"] as const,
    list: () => [...queryKeys.posts.all, "list"] as const,
    adminList: (params: { page: number; limit: number; search?: string }) =>
      [...queryKeys.posts.all, "admin", params] as const,
    /** Use for usePaginatedQuery key prefix and invalidation. */
    adminListPrefix: () => [...queryKeys.posts.all, "admin"] as const,
    detail: (id: string) => [...queryKeys.posts.all, "detail", id] as const,
  },
} as const;
