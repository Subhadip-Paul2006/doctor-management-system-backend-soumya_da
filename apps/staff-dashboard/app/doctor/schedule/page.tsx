import { PageHeader } from "@doctor/ui";
import { getDoctorSchedule } from "../../_data/doctor";
import { ScheduleManagerClient } from "../../_components/ScheduleManagerClient";

export const metadata = {
  title: "Schedule & Availability",
  description: "Configure queue mode, consultation duration and weekly working hours.",
};

export default function DoctorSchedulePage() {
  // Mock data — Phase 09 wires GET/PUT /api/v1/doctors/schedule.
  const schedule = getDoctorSchedule();

  return (
    <div>
      <PageHeader
        title="Schedule & availability"
        description="Control how patients book and when you consult at your clinic."
      />
      <div className="mt-6">
        <ScheduleManagerClient initial={schedule} />
      </div>
    </div>
  );
}
