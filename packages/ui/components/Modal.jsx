"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cx } from "./_cx";

export function Modal({ open, onClose, title, className = "", children, ...props }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-900/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        ref={panelRef}
        tabIndex={-1}
        className={cx(
          "relative z-10 w-full max-w-lg rounded-lg bg-white shadow-overlay outline-none",
          className
        )}
        {...props}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-navy-200 px-5 py-3">
            <h2 className="text-lg font-medium text-navy-800">{title}</h2>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className="rounded-md p-1 text-navy-500 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-medical-500"
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="px-5 py-4 text-sm text-navy-800">{children}</div>
      </div>
    </div>,
    document.body
  );
}
