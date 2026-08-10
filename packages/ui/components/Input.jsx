"use client";

import { useId } from "react";

export function Input({ label, error, className = "", id, ...props }) {
  const autoId = useId();
  const inputId = id || props.name || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-800 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full bg-white border rounded-md px-3 py-2 text-sm text-navy-800 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all ${
          error ? "border-rose-500 focus:ring-rose-500" : "border-navy-300"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
