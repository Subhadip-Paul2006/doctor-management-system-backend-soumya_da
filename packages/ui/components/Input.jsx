"use client";

import { useId } from "react";
import { cx } from "./_cx";

const inputBase =
  "w-full bg-white border rounded-md px-3 py-2 text-sm text-navy-800 placeholder-navy-500 " +
  "focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all " +
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-navy-50";

export function Input({ label, error, hint, icon = null, className = "", id, ...props }) {
  const autoId = useId();
  const inputId = id || props.name || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-800 mb-1">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-navy-500">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cx(
            inputBase,
            icon && "pl-9",
            error ? "border-rose-500 focus:ring-rose-500" : "border-navy-300",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-navy-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
