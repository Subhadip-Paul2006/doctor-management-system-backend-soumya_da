"use client";

import { useId } from "react";
import { cx } from "./_cx";

export function Textarea({ label, error, hint, rows = 4, className = "", id, ...props }) {
  const autoId = useId();
  const textareaId = id || props.name || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-navy-800 mb-1">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        className={cx(
          "w-full bg-white border rounded-md px-3 py-2 text-sm text-navy-800 placeholder-navy-500",
          "focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-navy-50",
          error ? "border-rose-500 focus:ring-rose-500" : "border-navy-300",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="mt-1 text-xs text-navy-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
