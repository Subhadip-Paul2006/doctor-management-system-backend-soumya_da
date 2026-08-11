import { Sidebar } from "./Sidebar";
import { StaffHeader } from "./StaffHeader";

export function StaffShell({ role, children }) {
  return (
    <div className="flex min-h-screen bg-navy-50 font-sans">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <StaffHeader role={role} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
