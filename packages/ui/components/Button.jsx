"use client";

import { cx } from "./_cx";
import { Spinner } from "./Spinner";

const VARIANT_CLASSES = {
  primary: "bg-medical-600 hover:bg-medical-700 text-white shadow-sm",
  secondary: "bg-navy-100 hover:bg-navy-200 text-navy-900",
  outline: "border border-medical-600 text-medical-700 hover:bg-medical-50",
  ghost: "text-navy-700 hover:bg-navy-100",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" label={null} /> : null}
      {children}
    </button>
  );
}
