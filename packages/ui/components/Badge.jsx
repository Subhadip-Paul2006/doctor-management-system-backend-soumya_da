import { cx } from "./_cx";

const VARIANT_CLASSES = {
  // Appointment/queue status variants — keyed to Prisma AppointmentStatus + isEmergency
  waiting: "bg-status-waiting-bg text-status-waiting-text border border-status-waiting-border",
  "checked-in": "bg-status-checkedIn-bg text-status-checkedIn-text border border-status-checkedIn-border",
  completed: "bg-status-completed-bg text-status-completed-text border border-status-completed-border",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-text border border-status-cancelled-border",
  absent: "bg-status-absent-bg text-status-absent-text border border-status-absent-border",
  emergency: "bg-status-emergency-bg text-status-emergency-text border border-status-emergency-border animate-pulse",
  // Generic semantic variants
  success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border border-amber-200",
  danger: "bg-rose-100 text-rose-800 border border-rose-200",
  info: "bg-sky-100 text-sky-800 border border-sky-200",
  neutral: "bg-navy-100 text-navy-700 border border-navy-200",
};

/**
 * @param {Object} props
 * @param {string} [props.variant]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export function Badge({ variant = "neutral", className = "", children, ...props }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
