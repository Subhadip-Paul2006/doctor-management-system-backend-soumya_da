import Link from "next/link";
import { Button, PageHeader } from "@doctor/ui";
import { listMyAppointments } from "../../_data/patient";
import { AppointmentsClient } from "../../_components/AppointmentsClient";

export const metadata = {
  title: "My Appointments",
  description: "View upcoming, completed and cancelled appointments.",
};

const ORDER: Record<string, number> = { WAITING: 0, CHECKED_IN: 1, COMPLETED: 2, CANCELLED: 3, ABSENT: 4 };

export default function PatientAppointmentsPage() {
  // Mock data — swap for GET /api/v1/patient/my-appointments in Phase 09.
  const appointments = listMyAppointments().sort((a, b) => {
    const byStatus = (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9);
    return byStatus !== 0 ? byStatus : b.date.localeCompare(a.date);
  });

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Appointments" }]}
        title="My Appointments"
        description="Track upcoming visits and review your consultation history."
        actions={
          <Link href="/doctors">
            <Button size="sm">Book appointment</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <AppointmentsClient appointments={appointments} />
      </div>
    </div>
  );
}
