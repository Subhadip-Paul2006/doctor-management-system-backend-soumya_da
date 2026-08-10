import { cx } from "./_cx";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-pulse rounded bg-navy-200", className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div aria-hidden="true" className={cx("space-y-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cx("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
