"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Table, Tabs, Toast } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";

const STATUS_VARIANT = {
  WAITING: "waiting",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "absent",
};

const QUEUE_STATUS_META = {
  OPEN: { badge: "success", label: "Queue open" },
  PAUSED: { badge: "warning", label: "Queue paused" },
  CLOSED: { badge: "neutral", label: "Queue closed" },
};

/**
 * Phase 07: check-in desk held in local per-doctor state seeded from
 * `_data/receptionist.js`. Phase 09 persists CHECKED_IN via
 * PUT /api/v1/appointments/:id/status (confirmed contract); Phase 10 reflects
 * live queueUpdate/tokenCalled events.
 */
export function QueueDeskClient({ doctors, queuesByDoctor }) {
  const [activeDoctorId, setActiveDoctorId] = useState(doctors[0]?.id ?? null);
  // Map doctorId -> mutable token list (local copy of seeded mock data).
  const [tokensByDoctor, setTokensByDoctor] = useState(() => {
    const init = {};
    for (const d of doctors) {
      const q = queuesByDoctor[d.id];
      init[d.id] = q ? q.tokens.map((t) => ({ ...t })) : [];
    }
    return init;
  });
  const [checkingIn, setCheckingIn] = useState(null); // appointment id in-flight
  const [toast, setToast] = useState(null);

  const activeQueue = activeDoctorId ? queuesByDoctor[activeDoctorId] : null;
  const tokens = useMemo(
    () => (activeDoctorId ? tokensByDoctor[activeDoctorId] ?? [] : []),
    [activeDoctorId, tokensByDoctor]
  );

  const waitingCount = useMemo(
    () => tokens.filter((t) => t.status === "WAITING").length,
    [tokens]
  );
  const checkedInCount = useMemo(
    () => tokens.filter((t) => t.status === "CHECKED_IN").length,
    [tokens]
  );

  function markCheckedIn(appointment) {
    setCheckingIn(appointment.id);
    // Simulate PUT /api/v1/appointments/:id/status { status: "CHECKED_IN" }.
    setTimeout(() => {
      setTokensByDoctor((prev) => ({
        ...prev,
        [activeDoctorId]: prev[activeDoctorId].map((t) =>
          t.id === appointment.id ? { ...t, status: "CHECKED_IN" } : t
        ),
      }));
      setCheckingIn(null);
      setToast({ message: `${appointment.patient} checked in.`, variant: "success" });
    }, 350);
  }

  const tabs = doctors.map((d) => ({
    value: d.id,
    label: d.name,
    content: null, // content rendered once below the tab bar
  }));

  const meta = activeQueue ? QUEUE_STATUS_META[activeQueue.status] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Select chamber" subtitle="Switch between doctors present today" />
        <CardBody>
          <Tabs tabs={tabs} value={activeDoctorId ?? undefined} onChange={setActiveDoctorId} aria-label="Doctor chamber" />
        </CardBody>
      </Card>

      {activeQueue ? (
        <Card>
          <CardHeader
            title={activeQueue.doctor.name}
            subtitle={activeQueue.doctor.specialization}
            action={meta ? <Badge variant={meta.badge}>{meta.label}</Badge> : null}
          />
          <CardBody>
            <div className="mb-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="text-xs text-navy-500">Now calling</p>
                <p className="mt-1 text-2xl font-black text-navy-900">{formatTokenNumber(activeQueue.currentToken)}</p>
              </div>
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="text-xs text-navy-500">Last token</p>
                <p className="mt-1 text-2xl font-black text-navy-900">{formatTokenNumber(activeQueue.lastTokenIssued)}</p>
              </div>
              <div className="rounded-lg bg-status-waiting-bg p-3 text-center">
                <p className="text-xs text-status-waiting-text">Waiting</p>
                <p className="mt-1 text-2xl font-black text-status-waiting-text">{waitingCount}</p>
              </div>
              <div className="rounded-lg bg-status-checkedIn-bg p-3 text-center">
                <p className="text-xs text-status-checkedIn-text">Checked in</p>
                <p className="mt-1 text-2xl font-black text-status-checkedIn-text">{checkedInCount}</p>
              </div>
            </div>

            <Table
              columns={[
                { key: "token", header: "Token", render: (r) => <span className="font-bold text-medical-700">{formatTokenNumber(r.token)}</span> },
                { key: "patient", header: "Patient" },
                { key: "phone", header: "Phone" },
                { key: "bookingSource", header: "Source" },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <span className="inline-flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[r.status]}>{r.status.replace("_", " ")}</Badge>
                      {r.isEmergency ? <Badge variant="emergency">Emergency</Badge> : null}
                    </span>
                  ),
                },
                {
                  key: "action",
                  header: "Action",
                  render: (r) =>
                    r.status === "WAITING" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markCheckedIn(r)}
                        loading={checkingIn === r.id}
                      >
                        Check in
                      </Button>
                    ) : (
                      <span className="text-xs text-navy-400">—</span>
                    ),
                },
              ]}
              data={tokens}
              empty={<EmptyState title="No tokens for this chamber" description="Tokens issued today will appear here." />}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <EmptyState title="No queue data" description="Select a chamber with an active queue to manage check-ins." />
        </Card>
      )}

      {toast ? <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
