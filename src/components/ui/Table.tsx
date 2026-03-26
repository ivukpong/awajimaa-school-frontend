"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  className?: string;
}

export function Table<T extends object>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = "No records found.",
  onRowClick,
  stickyHeader = false,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] as string;
      const bv = (b as Record<string, unknown>)[sortKey] as string;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  function SortIcon({ col }: { col: Column<T> }) {
    if (!col.sortable) return null;
    const k = String(col.key);
    if (sortKey !== k)
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800",
        className,
      )}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead
          className={cn(
            "bg-gray-50 dark:bg-gray-800/60",
            stickyHeader && "sticky top-0 z-10",
          )}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400",
                  col.sortable &&
                    "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200",
                  col.className,
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  <SortIcon col={col} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={String(row[keyField])}
                className={cn(
                  "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  onRowClick && "cursor-pointer",
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "px-4 py-3 text-sm text-gray-800 dark:text-gray-200",
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
