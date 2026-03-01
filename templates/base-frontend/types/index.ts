export type UserRole = "user" | "admin" | "manager";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
}

/** Backend success response shape (shared) */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface PostAuthor {
  _id: string;
  name: string;
  email: string;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  pagination: PaginationMeta;
}

/** Generic paginated API response for any resource (reusable across app). */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
