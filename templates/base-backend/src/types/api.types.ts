/**
 * Success response shape for API responses.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Error response shape for API responses.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | string[];
}

/**
 * Helper to build a success response payload.
 */
export function successResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

/**
 * Helper to build an error response payload.
 */
export function errorResponse(
  message: string,
  errors?: Record<string, string[]> | string[]
): ApiErrorResponse {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface RawPaginationQuery {
  page?: string | string[];
  limit?: string | string[];
}

export interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export function getPaginationParams(
  query: RawPaginationQuery,
  options: PaginationOptions = {}
): { page: number; limit: number } {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100,
  } = options;

  const rawPage = query.page;
  const rawLimit = query.limit;

  const pageParsed = rawPage ? Number.parseInt(Array.isArray(rawPage) ? rawPage[0] : rawPage, 10) : defaultPage;
  const limitParsed = rawLimit ? Number.parseInt(Array.isArray(rawLimit) ? rawLimit[0] : rawLimit, 10) : defaultLimit;

  const page = Number.isNaN(pageParsed) || pageParsed < 1 ? defaultPage : pageParsed;
  const limitUnbounded = Number.isNaN(limitParsed) || limitParsed < 1 ? defaultLimit : limitParsed;
  const limit = Math.min(limitUnbounded, maxLimit);

  return { page, limit };
}
