"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Data-driven role navigation — routes come from on-disk app segments, not docs guesses.
export const ROLE_NAV = {
  doctor: {
    label: "Doctor",
    home: "/doctor/dashboard",
    items: [
      { href: "/doctor/dashboard", label: "Dashboard" },
      { href: "/doctor/queue", label: "Live Queue" },
      { href: "/doctor/appointments", label: "Appointments" },
      { href: "/doctor/schedule", label: "Schedule" },
      { href: "/doctor/prescriptions", label: "Prescriptions" },
    ],
  },
  receptionist: {
    label: "Receptionist",
    home: "/receptionist/dashboard",
    items: [
      { href: "/receptionist/dashboard", label: "Dashboard" },
      { href: "/receptionist/walk-in", label: "Walk-in Registration" },
      { href: "/receptionist/queue-desk", label: "Queue Desk" },
      { href: "/receptionist/appointments", label: "Appointments" },
    ],
  },
  clinic: {
    label: "Clinic",
    home: "/clinic/dashboard",
    items: [
      { href: "/clinic/dashboard", label: "Dashboard" },
      { href: "/clinic/doctors", label: "Doctors" },
      { href: "/clinic/staff", label: "Staff" },
      { href: "/clinic/working-hours", label: "Working Hours" },
      { href: "/clinic/holidays", label: "Holidays" },
    ],
  },
  admin: {
    label: "Admin",
    home: "/admin/dashboard",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/clinics", label: "Clinics" },
      { href: "/admin/doctors", label: "Doctors" },
      { href: "/admin/announcements", label: "Announcements" },
    ],
  },
  "super-admin": {
    label: "Super Admin",
    home: "/super-admin/dashboard",
    items: [
      { href: "/super-admin/dashboard", label: "Dashboard" },
      { href: "/super-admin/clinics", label: "Clinics" },
      { href: "/super-admin/doctors", label: "Doctors" },
      { href: "/super-admin/admins", label: "Users & Admins" },
      { href: "/super-admin/platform-settings", label: "Platform Settings" },
    ],
  },
};

function NavItems({ role, onNavigate }) {
  const pathname = usePathname();
  const config = ROLE_NAV[role];
  if (!config) return null;
  return (
    <nav aria-label={`${config.label} navigation`} className="flex flex-col gap-1">
      {config.items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${
              active
                ? "bg-medical-50 text-medical-700 border-l-2 border-medical-600 -ml-0.5 pl-[calc(0.75rem+2px)]"
                : "text-navy-700 hover:bg-navy-50 hover:text-navy-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role }) {
  const config = ROLE_NAV[role];
  return (
    <aside className="hidden w-56 shrink-0 border-r border-navy-200 bg-white p-4 md:block" aria-label={config?.label}>
      <Link href="/" className="mb-6 block px-3 text-lg font-bold text-navy-900">
        <span className="text-medical-600">Doctor</span>MS
      </Link>
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">{config?.label}</p>
      <NavItems role={role} />
    </aside>
  );
}

export function MobileSidebar({ role, open, onClose }) {
  if (!open) return null;
  const config = ROLE_NAV[role];
  return (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label={`${config?.label} menu`}>
      <div className="absolute inset-0 bg-navy-900/50" onClick={onClose} aria-hidden="true" />
      <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-overlay">
        <div className="mb-6 flex items-center justify-between px-3">
          <Link href="/" className="text-lg font-bold text-navy-900" onClick={onClose}>
            <span className="text-medical-600">Doctor</span>MS
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-1 text-navy-500 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-medical-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">{config?.label}</p>
        <NavItems role={role} onNavigate={onClose} />
      </aside>
    </div>
  );
}
