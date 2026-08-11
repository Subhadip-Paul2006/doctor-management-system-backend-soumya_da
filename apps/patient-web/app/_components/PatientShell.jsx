"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, Dropdown, DropdownItem, Toast } from "@doctor/ui";

const PATIENT_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/appointments", label: "Appointments" },
  { href: "/live-queue", label: "Live Queue" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/reviews", label: "Reviews" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

function NavLinks({ onNavigate }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Patient navigation" className="flex flex-col gap-1">
      {PATIENT_NAV.map((item) => {
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

function PatientNotificationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen(true)}
        className="relative rounded-md p-2 text-navy-500 hover:bg-navy-100 hover:text-navy-800 focus:outline-none focus:ring-2 focus:ring-medical-500"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4c-.6-.6-1-1.4-1-2.3V9a5.6 5.6 0 00-4.5-5.5V3a1.1 1.1 0 00-2.2 0v.5A5.6 5.6 0 006.4 9v4.3c0 .9-.4 1.7-1 2.3L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
      {open ? <Toast message="Notification feed arrives in a later phase." variant="info" onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function PatientShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-navy-50 font-sans">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-navy-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-navy-700 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-medical-500 md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-lg font-bold text-navy-900">
            <span className="text-medical-600">Doctor</span>MS
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <PatientNotificationButton />
          <Dropdown
            align="right"
            trigger={
              <span className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-navy-50">
                <Avatar name="Guest Patient" size="sm" />
              </span>
            }
          >
            <DropdownItem disabled title="Available after authentication">Profile (post-auth)</DropdownItem>
            <DropdownItem disabled title="Available after authentication">Settings (post-auth)</DropdownItem>
            <DropdownItem disabled title="Available after authentication">Log out (post-auth)</DropdownItem>
          </Dropdown>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 p-4 sm:p-6">
        <aside className="hidden w-56 shrink-0 md:block" aria-label="Patient">
          <div className="sticky top-20 rounded-lg border border-navy-200 bg-white p-3 shadow-card">
            <NavLinks />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Patient menu">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-overlay">
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-lg font-bold text-navy-900"><span className="text-medical-600">Doctor</span>MS</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 text-navy-500 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-medical-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
