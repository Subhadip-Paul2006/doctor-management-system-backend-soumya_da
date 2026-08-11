import Link from "next/link";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-navy-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-navy-900"><span className="text-medical-600">Doctor</span>MS</p>
            <p className="mt-1 text-sm text-navy-500">Find verified doctors near you. Book live-queue tokens.</p>
          </div>
          <nav aria-label="Footer quick links" className="text-sm">
            <p className="font-semibold text-navy-800">Explore</p>
            <ul className="mt-2 space-y-1 text-navy-500">
              <li><Link href="/doctors" className="hover:text-medical-700">Find Doctors</Link></li>
              <li><Link href="/clinics" className="hover:text-medical-700">Clinics</Link></li>
              <li><Link href="/announcements" className="hover:text-medical-700">Announcements</Link></li>
            </ul>
          </nav>
          <div className="text-sm">
            <p className="font-semibold text-navy-800">Support</p>
            <ul className="mt-2 space-y-1 text-navy-500">
              <li><Link href="/login" className="hover:text-medical-700">Log in</Link></li>
              <li><Link href="/register" className="hover:text-medical-700">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-navy-200 pt-4 text-xs text-navy-500">
          © {year} DoctorMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
