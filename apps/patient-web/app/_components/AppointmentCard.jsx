import Link from "next/link";
import { Avatar, Badge, Button } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";

const STATUS_VARIANT = {
  WAITING: "waiting",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "absent",
};

const STATUS_LABEL = {
  WAITING: "Upcoming",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  ABSENT: "Missed",
};

function formatDisplayDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AppointmentCard({ appointment }) {
  const doctor = appointment.doctor;
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-navy-200 bg-white p-5 shadow-card sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <Avatar name={doctor ? doctor.name : "Doctor"} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-navy-900">
              {doctor ? doctor.name : "Doctor"}
            </h3>
            <Badge variant={STATUS_VARIANT[appointment.status] || "neutral"}>
              {STATUS_LABEL[appointment.status] || appointment.status}
            </Badge>
            {appointment.isEmergency ? <Badge variant="emergency">Emergency</Badge> : null}
          </div>
          {doctor ? (
            <p className="mt-0.5 text-sm text-navy-500">
              {doctor.specialization} · {doctor.clinic.clinicName}, {doctor.clinic.city}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-navy-700">
            {formatDisplayDate(appointment.date)} · {appointment.time}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        <div className="text-left sm:text-right">
          <p className="text-xs text-navy-500">Token</p>
          <p className="text-lg font-bold text-medical-700">{formatTokenNumber(appointment.token)}</p>
        </div>
        <Link href={`/appointments/${appointment.id}`}>
          <Button variant="outline" size="sm">View details</Button>
        </Link>
      </div>
    </article>
  );
}
