import { StaffShell } from "../_components/StaffShell";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffShell role="doctor">{children}</StaffShell>;
}
