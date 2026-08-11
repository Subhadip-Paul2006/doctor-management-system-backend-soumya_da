import { StaffShell } from "../_components/StaffShell";

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell role="receptionist">{children}</StaffShell>;
}
