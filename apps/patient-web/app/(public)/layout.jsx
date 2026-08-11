import { PublicNavbar } from "../_components/PublicNavbar";
import { PublicFooter } from "../_components/PublicFooter";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-50 font-sans">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
