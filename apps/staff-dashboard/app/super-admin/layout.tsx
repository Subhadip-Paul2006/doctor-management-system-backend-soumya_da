import { StaffShell } from "../_components/StaffShell";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell role="super-admin">{children}</StaffShell>;
}
