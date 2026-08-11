"use client";

import { useState } from "react";
import { UserMenu } from "./UserMenu";
import { NotificationButton } from "./NotificationButton";
import { MobileSidebar, ROLE_NAV } from "./Sidebar";

// Breadcrumbs derived from the current staff route — simple title-case formatter.
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@doctor/ui";

function pathToBreadcrumbs(pathname, role) {
  const segments = pathname.split("/").filter(Boolean);
  const items = [{ label: ROLE_NAV[role]?.label || "Staff", href: ROLE_NAV[role]?.home }];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += "/" + seg;
    if (i === segments.length - 1) {
      items.push({ label: seg.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") });
    }
  });
  return items;
}

export function StaffHeader({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-navy-200 bg-white px-4 shadow-card">
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
        <Breadcrumbs items={pathToBreadcrumbs(pathname || "/", role)} className="hidden sm:block" />
        <div className="ml-auto flex items-center gap-1">
          <NotificationButton />
          <UserMenu />
        </div>
      </header>
      <MobileSidebar role={role} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
