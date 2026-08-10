"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "./_cx";

export function Dropdown({ trigger, align = "right", className = "", children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cx("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cx(
            "absolute z-40 mt-2 min-w-40 overflow-hidden rounded-lg border border-navy-200 bg-white py-1 shadow-overlay",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ className = "", children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        "block w-full px-4 py-2 text-left text-sm text-navy-800 hover:bg-navy-50",
        "focus:outline-none focus:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
