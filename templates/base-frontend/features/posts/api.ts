"use client";

import api from "@/lib/axios";
import type {
  ApiSuccessResponse,
  Post,
  CreatePostInput,
  PaginatedPostsResponse,
} from "@/types";

export const postsApi = {
  getList: async (): Promise<Post[]> => {
    const res = await api.get<ApiSuccessResponse<{ posts: Post[] }>>("/posts");
    return res.data.data!.posts;
  },

  /** Admin: fetch one page of posts (server-side pagination). */
  getAdminList: async (params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedPostsResponse> => {
    const res = await api.get<
      ApiSuccessResponse<{ posts: Post[]; pagination: PaginatedPostsResponse["pagination"] }>
    >("/posts/admin", { params });
    const data = res.data.data!;
    return { posts: data.posts, pagination: data.pagination };
  },

  getById: async (id: string): Promise<Post> => {
    const res = await api.get<ApiSuccessResponse<{ post: Post }>>(`/posts/${id}`);
    return res.data.data!.post;
  },

  create: async (data: CreatePostInput): Promise<Post> => {
    const res = await api.post<ApiSuccessResponse<{ post: Post }>>("/posts", data);
    return res.data.data!.post;
  },
};

