"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta } from "@/types";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface PaginatedDataTableProps<T> {
  /** Column definitions (TanStack Table). */
  columns: ColumnDef<T>[];
  /** Current page of items. */
  data: T[];
  /** Server pagination meta (from API). */
  pagination: PaginationMeta | undefined;
  /** Controlled pagination state (0-based pageIndex, pageSize). */
  paginationState: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  /** Loading state. */
  isLoading?: boolean;
  /** Error state. */
  isError?: boolean;
  /** Error message when isError is true. */
  errorMessage?: string;
  /** Shown when data is empty and not loading. */
  emptyMessage?: string;
  /** Label for "Showing X–Y of Z {itemLabel}" (e.g. "posts"). */
  itemLabel?: string;
  /** Page size options for the selector. */
  pageSizeOptions?: number[];
  /** Optional title above the table. */
  title?: string;
  /** Optional actions in the header (e.g. Refresh button). */
  headerActions?: React.ReactNode;
  /** Max height for the scrollable table body (e.g. "60vh"). */
  maxHeight?: string;
}

/**
 * Reusable server-side paginated data table. Use with usePaginatedQuery (or any
 * query that returns items + pagination) for a scalable, generic table.
 */
export function PaginatedDataTable<T>({
  columns,
  data,
  pagination,
  paginationState,
  onPaginationChange,
  isLoading = false,
  isError = false,
  errorMessage = "Failed to load data",
  emptyMessage = "No data.",
  itemLabel = "items",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  title,
  headerActions,
  maxHeight = "60vh",
}: PaginatedDataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    pageCount: pagination?.totalPages ?? 0,
    state: { pagination: paginationState },
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const showPaginationBar =
    !isLoading &&
    !isError &&
    data.length > 0 &&
    pagination &&
    pagination.totalItems > 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {(title != null || headerActions != null) && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          {title != null && (
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
          )}
          {headerActions != null && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      {pagination != null && (
        <p className="border-b border-zinc-200 px-6 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Showing {(pagination.page - 1) * pagination.limit + 1}–
          {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{" "}
          {pagination.totalItems} {itemLabel}
        </p>
      )}
      <div className="overflow-auto" style={{ maxHeight }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-zinc-500">
            Loading…
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-zinc-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {showPaginationBar && pagination && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Rows per page
            </span>
            <select
              value={paginationState.pageSize}
              onChange={(e) =>
                onPaginationChange((prev) => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  pageIndex: 0,
                }))
              }
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() =>
                onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))
              }
              disabled={!pagination.hasPrevPage}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
              disabled={!pagination.hasNextPage}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
