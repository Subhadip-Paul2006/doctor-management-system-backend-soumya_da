import { cx } from "./_cx";

const SIZE_CLASSES = {
  sm: "h-3 w-3",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", label = "Loading", className = "" }) {
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  return (
    <span role="status" aria-live="polite" aria-label={label || undefined} className={cx("inline-flex", className)}>
      <svg
        className={cx("animate-spin text-current", sizeClasses)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
