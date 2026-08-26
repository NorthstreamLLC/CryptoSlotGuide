"use client";

import { useState, type ReactNode } from "react";

/**
 * Shared table primitive — CSS grid rows in a bordered, rounded container,
 * horizontally scrollable with an explicit min-width so columns never
 * crush. Sortable headers are real buttons; roles follow the accessibility
 * notes in design/README.md.
 */
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => number | string;
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  minWidth = 720,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  minWidth?: number;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const sortCol = columns.find((c) => c.key === sortKey);
  const sorted = sortCol?.sortValue
    ? [...rows].sort((a, b) => {
        const av = sortCol.sortValue!(a);
        const bv = sortCol.sortValue!(b);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === "asc" ? cmp : -cmp;
      })
    : rows;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border shadow-card">
      <div role="table" style={{ minWidth }} className="w-full">
        <div
          role="row"
          className="grid bg-surface-header"
          style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
        >
          {columns.map((col) => (
            <div
              role="columnheader"
              key={col.key}
              className={`px-4 py-2.5 ${col.align === "right" ? "text-right" : "text-left"}`}
            >
              {col.sortable ? (
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.07em] text-text-dim transition-colors hover:text-text-secondary"
                >
                  {col.label}
                  {sortKey === col.key && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
                </button>
              ) : (
                <span className="font-mono text-[10.5px] uppercase tracking-[0.07em] text-text-dim">
                  {col.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <div role="rowgroup">
          {sorted.map((row) => (
            <div
              role="row"
              key={rowKey(row)}
              className="grid border-t border-row-divider transition-colors hover:bg-row-hover"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map((col) => (
                <div
                  role="cell"
                  key={col.key}
                  className={`px-4 py-3 font-mono text-[13px] text-text-secondary ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render(row)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
