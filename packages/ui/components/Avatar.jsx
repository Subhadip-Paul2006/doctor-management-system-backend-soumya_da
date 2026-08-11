import { cx } from "./_cx";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.name]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {string} [props.className]
 */
export function Avatar({ src, alt = "", name, size = "md", className = "" }) {
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cx("rounded-full object-cover", sizeClasses, className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name || alt || "Avatar"}
      className={cx(
        "inline-flex items-center justify-center rounded-full bg-medical-100 font-semibold text-medical-800",
        sizeClasses,
        className
      )}
    >
      {initials(name || alt)}
    </span>
  );
}
