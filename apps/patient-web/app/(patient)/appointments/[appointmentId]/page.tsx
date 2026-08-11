import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, PageHeader } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";
import { getAppointmentById } from "../../../_data/patient";

export function generateMetadata({ params }: { params: { appointmentId: string } }) {
  const appt = getAppointmentById(params.appointmentId);
  return { title: appt ? `Appointment ${formatTokenNumber(appt.token)}` : "Appointment not found" };
}

const STATUS_VARIANT: Record<string, string> = {
  WAITING: "waiting",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "absent",
};

export default function AppointmentDetailPage({
  params,
}: {
  params: { appointmentId: string };
}) {
  // Mock data — swap for GET /api/v1/appointments/:id in Phase 09.
  const appt = getAppointmentById(params.appointmentId);
  if (!appt) notFound();

  const doctor = appt.doctor;
  const isActive = appt.status === "WAITING" || appt.status === "CHECKED_IN";
  const isToday = appt.dateOffset === 0 && isActive;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Appointments", href: "/appointments" },
          { label: formatTokenNumber(appt.token) },
        ]}
        title="Appointment details"
        description="Token, schedule and visit information for this booking."
        actions={
          isToday ? (
            <Link href="/live-queue">
              <Button size="sm">Track live queue</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            title={doctor ? doctor.name : "Doctor"}
            subtitle={doctor ? `${doctor.qualification} · ${doctor.specialization}` : undefined}
            action={<Badge variant={STATUS_VARIANT[appt.status] ?? "neutral"}>{appt.status.replace("_", " ")}</Badge>}
          />
          <CardBody>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-navy-50 p-4">
                <dt className="text-xs text-navy-500">Token number</dt>
                <dd className="mt-1 text-3xl font-black text-medical-700">{formatTokenNumber(appt.token)}</dd>
              </div>
              <div className="rounded-lg bg-navy-50 p-4">
                <dt className="text-xs text-navy-500">Date & time</dt>
                <dd className="mt-1 text-sm font-semibold text-navy-900">
                  {new Date(`${appt.date}T00:00:00`).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
                <dd className="text-sm text-navy-700">{appt.time}</dd>
              </div>
              <div>
                <dt className="text-xs text-navy-500">Booking source</dt>
                <dd className="mt-0.5 text-sm text-navy-800">{appt.bookingSource}</dd>
              </div>
              <div>
                <dt className="text-xs text-navy-500">Queue mode</dt>
                <dd className="mt-0.5 text-sm text-navy-800">
                  {doctor?.queueMode === "LIVE" ? "Live queue" : "Time slot"}
                </dd>
              </div>
              {doctor ? (
                <div>
                  <dt className="text-xs text-navy-500">Consultation fee</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-navy-900">₹{doctor.fee}</dd>
                </div>
              ) : null}
              {appt.isEmergency ? (
                <div>
                  <dt className="text-xs text-navy-500">Priority</dt>
                  <dd className="mt-0.5"><Badge variant="emergency">Emergency</Badge></dd>
                </div>
              ) : null}
            </dl>
          </CardBody>
        </Card>

        <aside className="space-y-4">
          {doctor ? (
            <Card>
              <CardBody className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={doctor.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy-900">{doctor.name}</p>
                    <p className="text-xs text-navy-500">{doctor.clinic.clinicName}, {doctor.clinic.city}</p>
                  </div>
                </div>
                <div className="flex gap-2 border-t border-navy-200 pt-3">
                  <Link href={`/doctors/${doctor.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Doctor profile</Button>
                  </Link>
                  <Link href={`/clinics/${doctor.clinic.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">Clinic</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {appt.status === "COMPLETED" && !appt.reviewed ? (
            <Card>
              <CardBody className="space-y-2 p-5">
                <p className="text-sm font-semibold text-navy-900">How was your visit?</p>
                <p className="text-xs text-navy-500">Share feedback to help other patients choose.</p>
                <Link href="/reviews">
                  <Button size="sm" className="w-full">Rate & review</Button>
                </Link>
              </CardBody>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
