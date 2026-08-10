"use client";

import { Alert } from "./Alert";
import { cx } from "./_cx";

export function Toast({ message, variant = "info", onClose, className = "" }) {
  if (!message) return null;
  return (
    <div className={cx("fixed bottom-4 right-4 z-50 flex items-start gap-2", className)}>
      <Alert variant={variant} className="min-w-64 shadow-overlay">
        <div className="flex items-start justify-between gap-3">
          <div>{message}</div>
          {onClose ? (
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onClose}
              className="rounded px-1 leading-none hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              ×
            </button>
          ) : null}
        </div>
      </Alert>
    </div>
  );
}
