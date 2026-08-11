import Link from "next/link";

// items: [{ label, href? }] — last item without href is the current page.
export function Breadcrumbs({ items = [], className = "" }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 ? <span aria-hidden="true" className="text-navy-300">/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-medical-700 hover:underline underline-offset-2">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-navy-800" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
