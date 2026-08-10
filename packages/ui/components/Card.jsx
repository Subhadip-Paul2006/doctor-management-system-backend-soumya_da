import { cx } from "./_cx";

export function Card({ interactive = false, padding = "p-5", className = "", children, ...props }) {
  return (
    <div
      className={cx(
        "bg-white border border-navy-200 rounded-lg shadow-card",
        interactive && "cursor-pointer hover:shadow-card-hover hover:border-medical-200 transition-all",
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={cx("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        {title ? <h3 className="text-xl font-semibold text-navy-900">{title}</h3> : null}
        {subtitle ? <p className="mt-0.5 text-xs text-navy-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={cx("text-sm text-navy-800", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={cx("mt-4 border-t border-navy-200 pt-4", className)}>{children}</div>;
}
