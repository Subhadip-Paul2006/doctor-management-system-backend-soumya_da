import { StaffShell } from "../_components/StaffShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell role="admin">{children}</StaffShell>;
}
