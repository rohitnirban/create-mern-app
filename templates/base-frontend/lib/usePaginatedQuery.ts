"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { PaginationMeta } from "@/types";

export interface PaginatedQueryParams {
  page: number;
  limit: number;
  [key: string]: unknown;
}

export interface UsePaginatedQueryOptions<T, TParams extends PaginatedQueryParams> {
  /** Query key prefix; params will be appended for cache per page/filter. */
  queryKeyPrefix: readonly unknown[];
  /** Fetcher returning items + pagination. Use for any resource (posts, users, etc.). */
  queryFn: (params: TParams) => Promise<{ items: T[]; pagination: PaginationMeta }>;
  staleTime?: number;
  enabled?: boolean;
}

/**
 * Generic paginated query hook. Use for any list that supports server-side pagination.
 * Caches by (queryKeyPrefix + params) so each page/filter is cached separately.
 * Scalable for large apps: only one page of data is fetched per request.
 */
export function usePaginatedQuery<T, TParams extends PaginatedQueryParams>(
  params: TParams,
  options: UsePaginatedQueryOptions<T, TParams>
) {
  const { queryKeyPrefix, queryFn, staleTime = 60_000, enabled = true } = options;

  return useQuery({
    queryKey: [...queryKeyPrefix, params],
    queryFn: () => queryFn(params),
    staleTime,
    enabled,
  } as UseQueryOptions<{ items: T[]; pagination: PaginationMeta }>);
}
