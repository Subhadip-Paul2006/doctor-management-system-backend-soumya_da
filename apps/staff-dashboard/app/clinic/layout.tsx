import { StaffShell } from "../_components/StaffShell";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell role="clinic">{children}</StaffShell>;
}
