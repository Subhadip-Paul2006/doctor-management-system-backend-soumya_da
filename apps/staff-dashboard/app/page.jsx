import Link from "next/link";
import { Button, Card, CardBody } from "@doctor/ui";

export const metadata = { title: "Staff Dashboard" };

const PORTALS = [
  { href: "/doctor/dashboard", label: "Doctor", desc: "Queue console, schedule & consultations" },
  { href: "/receptionist/dashboard", label: "Receptionist", desc: "Front desk, walk-ins & token desk" },
  { href: "/clinic/dashboard", label: "Clinic", desc: "Doctors, staff & working hours" },
  { href: "/admin/dashboard", label: "Admin", desc: "Approvals, doctors & announcements" },
  { href: "/super-admin/dashboard", label: "Super Admin", desc: "Platform settings & admins" },
];

export default function StaffHomePage() {
  return (
    <main className="min-h-screen bg-navy-50 font-sans">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-medical-600">Staff Portal</p>
          <h1 className="text-2xl font-bold text-navy-900">Choose your workspace</h1>
          <p className="text-sm text-navy-500">Sign in is handled per role workspace.</p>
        </header>
        <div className="mt-8 grid gap-4">
          <Card>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-medium text-navy-900">Design System Showcase</p>
                <p className="text-sm text-navy-500">All @doctor/ui primitives (Phase 02)</p>
              </div>
              <Link href="/design-system">
                <Button size="sm">Open</Button>
              </Link>
            </CardBody>
          </Card>
          {PORTALS.map((p) => (
            <Card key={p.href} interactive>
              <CardBody className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-navy-900">{p.label}</p>
                  <p className="text-sm text-navy-500">{p.desc}</p>
                </div>
                <Link href={p.href}>
                  <Button variant="outline" size="sm">Enter</Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
