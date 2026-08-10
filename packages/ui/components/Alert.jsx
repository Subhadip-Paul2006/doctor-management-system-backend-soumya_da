import { cx } from "./_cx";

const VARIANT_CLASSES = {
  success: "bg-status-completed-bg text-status-completed-text border-status-completed-border",
  info: "bg-status-checkedIn-bg text-status-checkedIn-text border-status-checkedIn-border",
  warning: "bg-status-waiting-bg text-status-waiting-text border-status-waiting-border",
  danger: "bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border",
  neutral: "bg-navy-100 text-navy-800 border-navy-200",
};

export function Alert({ variant = "neutral", title, className = "", children, ...props }) {
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cx("rounded-lg border px-4 py-3 text-sm", VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral, className)}
      {...props}
    >
      {title ? <p className="font-semibold mb-0.5">{title}</p> : null}
      {children}
    </div>
  );
}
