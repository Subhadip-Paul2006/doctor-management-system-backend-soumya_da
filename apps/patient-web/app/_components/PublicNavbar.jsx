"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@doctor/ui";

const PUBLIC_LINKS = [
  { href: "/doctors", label: "Find Doctors" },
  { href: "/clinics", label: "Clinics" },
  { href: "/announcements", label: "Announcements" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href) {
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-navy-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4"
      >
        <Link href="/" className="text-lg font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-medical-500 rounded px-1">
          <span className="text-medical-600">Doctor</span>MS
        </Link>

        <div className="hidden items-center gap-6 md:flex" role="menubar">
          {PUBLIC_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                isActive(link.href) ? "text-medical-700 underline underline-offset-4" : "text-navy-700 hover:text-medical-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link href="/register"><Button size="sm">Sign up</Button></Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-navy-700 hover:bg-navy-100 focus:outline-none focus:ring-2 focus:ring-medical-500 md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open ? (
        <div className="border-t border-navy-200 bg-white md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(link.href) ? "bg-medical-50 text-medical-700" : "text-navy-700 hover:bg-navy-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 border-t border-navy-200 pt-3">
              <Link href="/login" className="flex-1" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Log in</Button></Link>
              <Link href="/register" className="flex-1" onClick={() => setOpen(false)}><Button className="w-full">Sign up</Button></Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
