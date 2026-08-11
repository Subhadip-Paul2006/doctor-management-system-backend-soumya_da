import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";
import { getActiveQueueSnapshot, getUpcomingAppointments, listReviewableAppointments } from "../../_data/patient";
import { AppointmentCard } from "../../_components/AppointmentCard";

export const metadata = {
  title: "Patient Dashboard",
  description: "Your appointments, live queue status and recent activity.",
};

export default function PatientDashboardPage() {
  // Mock data — Phase 09 wires GET /api/v1/patient/my-appointments + auth/me.
  const upcoming = getUpcomingAppointments().sort((a, b) => a.date.localeCompare(b.date));
  const queue = getActiveQueueSnapshot();
  const reviewable = listReviewableAppointments();

  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Here's your schedule and queue status at a glance."
        actions={
          <Link href="/doctors">
            <Button size="sm">Book appointment</Button>
          </Link>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Active live-token widget */}
        {queue ? (
          <Card className="border-medical-200">
            <CardHeader
              title="Active live queue"
              subtitle={`${queue.doctor.name} · ${queue.clinic.clinicName}`}
              action={
                <Badge variant={queue.status === "OPEN" ? "info" : queue.status === "PAUSED" ? "warning" : "neutral"}>
                  {queue.status === "OPEN" ? "Queue open" : queue.status === "PAUSED" ? "Queue paused" : "Queue closed"}
                </Badge>
              }
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-navy-50 p-4 text-center">
                  <p className="text-xs text-navy-500">Now calling</p>
                  <p className="mt-1 text-4xl font-black text-navy-900">{formatTokenNumber(queue.currentToken)}</p>
                </div>
                <div className="rounded-lg bg-medical-50 p-4 text-center">
                  <p className="text-xs text-medical-800">Your token</p>
                  <p className="mt-1 text-4xl font-black text-medical-700">{formatTokenNumber(queue.myToken)}</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-4 text-center">
                  <p className="text-xs text-navy-500">Est. wait</p>
                  <p className="mt-1 text-4xl font-black text-navy-900">
                    {Math.max(queue.myToken - queue.currentToken, 0) * queue.avgConsultationMinutes}
                    <span className="text-base font-semibold text-navy-500"> min</span>
                  </p>
                  <p className="text-xs text-navy-500">
                    {Math.max(queue.myToken - queue.currentToken, 0)} patient(s) ahead of you
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/live-queue">
                  <Button size="sm" variant="outline">Open live tracker</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {/* Upcoming appointments */}
        <section aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="upcoming-heading" className="text-xl font-semibold text-navy-900">Upcoming appointments</h2>
            <Link href="/appointments" className="text-sm font-medium text-medical-700 hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <AppointmentCard appointment={a} />
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <EmptyState
                title="No upcoming appointments"
                description="Book a token with a verified doctor to see it here."
                action={
                  <Link href="/doctors">
                    <Button size="sm">Find doctors</Button>
                  </Link>
                }
              />
            </Card>
          )}
        </section>

        {/* Quick actions */}
        <section aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="mb-3 text-xl font-semibold text-navy-900">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card interactive padding="p-4">
              <Link href="/doctors" className="block">
                <p className="text-sm font-semibold text-navy-900">Find a doctor</p>
                <p className="mt-1 text-xs text-navy-500">Search by specialization or city and book a token.</p>
              </Link>
            </Card>
            <Card interactive padding="p-4">
              <Link href="/appointments" className="block">
                <p className="text-sm font-semibold text-navy-900">Appointment history</p>
                <p className="mt-1 text-xs text-navy-500">See completed and cancelled visits.</p>
              </Link>
            </Card>
            <Card interactive padding="p-4">
              <Link href="/reviews" className="block">
                <p className="text-sm font-semibold text-navy-900">Rate a visit</p>
                <p className="mt-1 text-xs text-navy-500">
                  {reviewable.length > 0
                    ? `${reviewable.length} completed visit${reviewable.length === 1 ? "" : "s"} awaiting your feedback.`
                    : "Share feedback on your consultations."}
                </p>
              </Link>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
