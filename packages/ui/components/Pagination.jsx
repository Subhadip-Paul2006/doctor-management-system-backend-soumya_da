"use client";

import { cx } from "./_cx";

export function Pagination({ page, totalPages, onPageChange, className = "" }) {
  if (!totalPages || totalPages <= 1) return null;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const btn =
    "px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className={cx("flex items-center justify-between gap-3", className)}>
      <button type="button" disabled={!canPrev} onClick={() => onPageChange?.(page - 1)} className={cx(btn, "border border-navy-300 text-navy-800 hover:bg-navy-50")}>
        Previous
      </button>
      <span className="text-sm text-navy-500" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={!canNext} onClick={() => onPageChange?.(page + 1)} className={cx(btn, "border border-navy-300 text-navy-800 hover:bg-navy-50")}>
        Next
      </button>
    </nav>
  );
}
