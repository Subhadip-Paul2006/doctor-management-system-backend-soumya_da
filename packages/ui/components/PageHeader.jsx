import { Breadcrumbs } from "./Breadcrumbs";

/**
 * @param {Object} props
 * @param {{label: string, href?: string}[]} [props.breadcrumbs]
 * @param {import('react').ReactNode} [props.title]
 * @param {import('react').ReactNode} [props.description]
 * @param {import('react').ReactNode} [props.actions]
 * @param {string} [props.className]
 */
export function PageHeader({ breadcrumbs, title, description, actions, className = "" }) {
  return (
    <div className={className}>
      {breadcrumbs && breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} className="mb-2" /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {title ? <h1 className="text-2xl font-bold text-navy-900">{title}</h1> : null}
          {description ? <p className="mt-1 text-sm text-navy-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
