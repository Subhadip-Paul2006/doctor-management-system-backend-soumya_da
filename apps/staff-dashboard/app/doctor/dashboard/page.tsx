import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, PageHeader } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";
import { getTodayQueue } from "../../_data/doctor";

export const metadata = {
  title: "Doctor Dashboard",
  description: "Today's consultations, active token and queue overview.",
};

const STATUS_VARIANT: Record<string, string> = {
  WAITING: "waiting",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "absent",
};

export default function DoctorDashboardPage() {
  // Mock data — Phase 09 wires GET /api/v1/queue/today + dashboard endpoints.
  const queue = getTodayQueue();

  const waiting = queue.lastTokenIssued - queue.currentToken;
  const active = queue.tokens.find(
    (t) => t.token === queue.currentToken && (t.status === "CHECKED_IN" || t.status === "WAITING")
  );
  const nextFive = queue.tokens.filter((t) => t.status === "WAITING" || t.status === "CHECKED_IN").slice(0, 5);

  const queueStatusMeta =
    queue.status === "OPEN"
      ? { variant: "success", label: "Open", dot: "bg-status-completed-text" }
      : queue.status === "PAUSED"
        ? { variant: "warning", label: "Paused", dot: "bg-status-waiting-text" }
        : { variant: "neutral", label: "Closed", dot: "bg-navy-400" };

  return (
    <div>
      <PageHeader
        title={`Good day, ${queue.doctor.name}`}
        description={`${queue.clinic.clinicName}, ${queue.clinic.city} · ${queue.doctor.specialization}`}
        actions={
          <Link href="/doctor/queue">
            <Button size="sm">Open queue console</Button>
          </Link>
        }
      />

      {/* Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <p className="text-xs text-navy-500">Tokens issued today</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{queue.lastTokenIssued}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-navy-500">Currently serving</p>
          <p className="mt-1 text-3xl font-black text-medical-700">{formatTokenNumber(queue.currentToken)}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-navy-500">Patients waiting</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{waiting}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-navy-500">Consultations completed</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{queue.completedToday}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Status + active consultation */}
        <Card>
          <CardHeader
            title="Queue status"
            subtitle="Live chamber control state"
            action={<Badge variant={queueStatusMeta.variant}>{queueStatusMeta.label}</Badge>}
          />
          <CardBody>
            <div className="flex items-center gap-2 text-sm text-navy-800">
              <span className={`h-2.5 w-2.5 rounded-full ${queueStatusMeta.dot}`} aria-hidden="true" />
              Queue is {queueStatusMeta.label.toLowerCase()}.
            </div>

            <div className="mt-4 rounded-lg border border-navy-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Active consultation</p>
              {active ? (
                <div className="mt-2">
                  <p className="text-lg font-bold text-navy-900">
                    {formatTokenNumber(active.token)} — {active.patient}
                  </p>
                  <p className="text-sm text-navy-500">
                    {active.gender}, {active.age} yrs · {active.bookingSource}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={STATUS_VARIANT[active.status]}>{active.status.replace("_", " ")}</Badge>
                    {active.isEmergency ? <Badge variant="emergency">Emergency</Badge> : null}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-navy-500">No patient in session right now.</p>
              )}
            </div>

            <div className="mt-4">
              <Link href="/doctor/queue">
                <Button size="sm" variant="outline">Manage live queue</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Upcoming queue preview */}
        <Card>
          <CardHeader title="Upcoming in queue" subtitle="Next waiting patients" />
          <CardBody>
            {nextFive.length ? (
              <ul className="divide-y divide-navy-200">
                {nextFive.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-14 items-center justify-center rounded-md bg-medical-50 text-sm font-bold text-medical-700">
                        {formatTokenNumber(t.token)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-900">{t.patient}</p>
                        <p className="text-xs text-navy-500">{t.gender}, {t.age} yrs</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {t.isEmergency ? <Badge variant="emergency">Emergency</Badge> : null}
                      <Badge variant={STATUS_VARIANT[t.status]}>{t.status.replace("_", " ")}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-navy-500">No waiting patients. You&apos;re all caught up.</p>
              </div>
            )}
            <div className="mt-4 border-t border-navy-200 pt-3">
              <Link href="/doctor/appointments" className="text-sm font-medium text-medical-700 hover:underline">
                View all appointments
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
