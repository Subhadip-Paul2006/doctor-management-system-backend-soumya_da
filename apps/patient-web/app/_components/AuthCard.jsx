import Link from "next/link";
import { Card, CardBody } from "@doctor/ui";

/**
 * Shared centered auth card for the patient's public auth screens.
 * Title/subtitle render an accessible heading; footer holds the cross-link.
 */
/**
 * @param {Object} props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} [props.children]
 */
export function AuthCard({ title, subtitle, footer, children }) {
  return (
    <Card className="w-full max-w-md" padding="p-0">
      <div className="border-b border-navy-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-medical-600">DoctorMS</p>
        <h1 className="mt-1 text-xl font-bold text-navy-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-navy-500">{subtitle}</p> : null}
      </div>
      <CardBody className="px-6 py-5">{children}</CardBody>
      {footer ? (
        <div className="border-t border-navy-200 px-6 py-4 text-center text-sm text-navy-500">{footer}</div>
      ) : null}
    </Card>
  );
}

/** Small helper for the auth footer cross-links, keeping markup consistent. */
export function AuthFooterLink({ prefix, href, label }) {
  return (
    <span>
      {prefix}{" "}
      <Link href={href} className="font-medium text-medical-700 hover:underline">
        {label}
      </Link>
    </span>
  );
}
