"use client";

import { useId } from "react";
import { cx } from "./_cx";

export function Checkbox({ label, error, className = "", id, ...props }) {
  const autoId = useId();
  const checkboxId = id || props.name || autoId;
  return (
    <div className={cx("w-full", className)}>
      <label htmlFor={checkboxId} className="flex items-start gap-2 cursor-pointer">
        <input
          id={checkboxId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          className="mt-0.5 h-4 w-4 rounded border-navy-300 text-medical-600 focus:ring-2 focus:ring-medical-500 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
          {...props}
        />
        {label ? <span className="text-sm text-navy-800">{label}</span> : null}
      </label>
      {error ? (
        <p id={`${checkboxId}-error`} className="mt-1 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
