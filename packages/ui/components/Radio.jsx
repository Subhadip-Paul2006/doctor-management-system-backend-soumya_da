"use client";

import { useId } from "react";
import { cx } from "./_cx";

export function Radio({ label, error, className = "", id, ...props }) {
  const autoId = useId();
  const radioId = id || `${props.name || "radio"}-${props.value ?? autoId}`;
  return (
    <div className={cx("inline-flex", className)}>
      <label htmlFor={radioId} className="flex items-center gap-2 cursor-pointer">
        <input
          id={radioId}
          type="radio"
          aria-invalid={error ? true : undefined}
          className="h-4 w-4 border-navy-300 text-medical-600 focus:ring-2 focus:ring-medical-500 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
          {...props}
        />
        {label ? <span className="text-sm text-navy-800">{label}</span> : null}
      </label>
      {error ? <p className="sr-only">{error}</p> : null}
    </div>
  );
}
