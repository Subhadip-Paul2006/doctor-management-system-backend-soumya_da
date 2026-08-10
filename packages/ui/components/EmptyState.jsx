import { cx } from "./_cx";

export function EmptyState({ icon = null, title, description, action = null, className = "" }) {
  return (
    <div className={cx("flex flex-col items-center justify-center text-center px-6 py-12", className)}>
      {icon ? <div className="mb-3 text-navy-300">{icon}</div> : null}
      {title ? <h3 className="text-lg font-medium text-navy-800">{title}</h3> : null}
      {description ? <p className="mt-1 max-w-sm text-sm text-navy-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
