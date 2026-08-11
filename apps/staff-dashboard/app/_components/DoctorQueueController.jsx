"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Table, Toast } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";

const STATUS_VARIANT = {
  WAITING: "waiting",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "absent",
};

const QUEUE_STATUS_META = {
  OPEN: { badge: "success", label: "Open" },
  PAUSED: { badge: "warning", label: "Paused" },
  CLOSED: { badge: "neutral", label: "Closed" },
};

/**
 * Phase 06: queue control works against local in-memory state seeded from
 * `_data/doctor.js`. Phase 09 wires the confirmed endpoints
 * (POST /api/v1/queue/next, PUT /api/v1/appointments/:id/status,
 * PUT /api/v1/queue/status); Phase 10 adds the socket broadcasts.
 */
export function DoctorQueueController({ initial }) {
  const [queueStatus, setQueueStatus] = useState(initial.status);
  const [currentToken, setCurrentToken] = useState(initial.currentToken);
  const [tokens, setTokens] = useState(initial.tokens);
  const [completedCount, setCompletedCount] = useState(initial.completedToday);
  const [busy, setBusy] = useState(null); // "next" | "complete" | "absent" | "pause"
  const [toast, setToast] = useState(null);

  const active = useMemo(
    () => tokens.find((t) => t.token === currentToken && (t.status === "CHECKED_IN" || t.status === "WAITING")) || null,
    [tokens, currentToken]
  );
  const waitingList = useMemo(
    () => tokens.filter((t) => t.status === "WAITING" || t.status === "CHECKED_IN"),
    [tokens]
  );
  const queueOpen = queueStatus === "OPEN";

  function simulate(action, fn, message) {
    setBusy(action);
    setTimeout(() => {
      fn();
      setBusy(null);
      if (message) setToast({ message, variant: "success" });
    }, 350);
  }

  function callNext() {
    const next = tokens.find((t) => t.token > currentToken && t.status === "WAITING");
    if (!next) {
      setToast({ message: "No more waiting tokens in today's queue.", variant: "warning" });
      return;
    }
    simulate("next", () => {
      setTokens((prev) => prev.map((t) => (t.id === next.id ? { ...t, status: "CHECKED_IN" } : t)));
      setCurrentToken(next.token);
    }, `Token ${formatTokenNumber(next.token)} called.`);
  }

  function markCompleted() {
    if (!active) return;
    simulate("complete", () => {
      setTokens((prev) => prev.map((t) => (t.id === active.id ? { ...t, status: "COMPLETED" } : t)));
      setCompletedCount((c) => c + 1);
    }, `${active.patient} marked completed.`);
  }

  function markAbsent() {
    if (!active) return;
    simulate("absent", () => {
      setTokens((prev) => prev.map((t) => (t.id === active.id ? { ...t, status: "ABSENT" } : t)));
    }, `${active.patient} marked absent.`);
  }

  function togglePause() {
    const next = queueStatus === "PAUSED" ? "OPEN" : "PAUSED";
    simulate("pause", () => {
      setQueueStatus(next);
    }, next === "PAUSED" ? "Queue paused." : "Queue resumed.");
  }

  const meta = QUEUE_STATUS_META[queueStatus];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Console */}
        <Card>
          <CardHeader
            title="Live queue console"
            subtitle={`${initial.doctor.name} · ${initial.clinic.clinicName}`}
            action={<Badge variant={meta.badge}>{meta.label}</Badge>}
          />
          <CardBody>
            <div className="rounded-xl bg-navy-900 p-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-300">Now serving</p>
              {active ? (
                <>
                  <p className="mt-1 text-6xl font-black text-white">{formatTokenNumber(active.token)}</p>
                  <p className="mt-2 text-sm text-navy-200">
                    {active.patient} · {active.gender}, {active.age} yrs
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Badge variant={STATUS_VARIANT[active.status]}>{active.status.replace("_", " ")}</Badge>
                    <Badge variant="neutral">{active.bookingSource}</Badge>
                    {active.isEmergency ? <Badge variant="emergency">Emergency</Badge> : null}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-base font-medium text-navy-300">No patient in session. Call the next token.</p>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button size="sm" onClick={callNext} disabled={!queueOpen} loading={busy === "next"}>
                Call next token
              </Button>
              <Button size="sm" variant="secondary" onClick={markCompleted} disabled={!active} loading={busy === "complete"}>
                Mark completed
              </Button>
              <Button size="sm" variant="outline" onClick={markAbsent} disabled={!active} loading={busy === "absent"}>
                Mark absent
              </Button>
              <Button size="sm" variant={queueStatus === "PAUSED" ? "primary" : "ghost"} onClick={togglePause} loading={busy === "pause"}>
                {queueStatus === "PAUSED" ? "Resume queue" : "Pause queue"}
              </Button>
            </div>
            {!queueOpen ? (
              <p className="mt-3 rounded-md bg-status-waiting-bg px-3 py-2 text-xs text-status-waiting-text" role="status">
                Queue is paused — advance is disabled until you resume.
              </p>
            ) : null}
          </CardBody>
        </Card>

        {/* Active patient detail */}
        <Card>
          <CardHeader title="Current patient" subtitle="Consultation details" />
          <CardBody>
            {active ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Name</dt><dd className="font-medium text-navy-900">{active.patient}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Age / Gender</dt><dd className="text-navy-800">{active.age} yrs · {active.gender}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Token</dt><dd className="font-semibold text-medical-700">{formatTokenNumber(active.token)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Booking</dt><dd className="text-navy-800">{active.bookingSource}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Status</dt><dd className="text-navy-800">{active.status.replace("_", " ")}</dd></div>
              </dl>
            ) : (
              <p className="text-sm text-navy-500">When you call a token, the patient&apos;s details appear here during the consultation.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Today's token list */}
      <Card>
        <CardHeader
          title="Today's tokens"
          subtitle={`${waitingList.length} waiting · ${completedCount} completed`}
        />
        <CardBody className="p-0">
          <Table
            className="border-0"
            columns={[
              { key: "token", header: "Token", render: (r) => <span className="font-bold text-medical-700">{formatTokenNumber(r.token)}</span> },
              { key: "patient", header: "Patient" },
              { key: "age", header: "Age", render: (r) => `${r.age} / ${r.gender}` },
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
            ]}
            data={tokens}
            empty={<p className="py-8 text-center text-sm text-navy-500">No tokens issued today.</p>}
          />
        </CardBody>
      </Card>

      {toast ? <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
