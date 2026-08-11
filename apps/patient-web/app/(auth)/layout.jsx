import { PublicNavbar } from "../_components/PublicNavbar";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-50 font-sans">
      <PublicNavbar />
      <main className="flex flex-1 items-center justify-center p-4">{children}</main>
    </div>
  );
}
