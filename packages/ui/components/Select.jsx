"use client";

import { useId } from "react";
import { cx } from "./_cx";

export function Select({ label, error, hint, className = "", id, children, ...props }) {
  const autoId = useId();
  const selectId = id || props.name || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-navy-800 mb-1">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        className={cx(
          "w-full appearance-none bg-white border rounded-md px-3 py-2 text-sm text-navy-800",
          "focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-navy-50",
          error ? "border-rose-500 focus:ring-rose-500" : "border-navy-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1 text-xs text-navy-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
