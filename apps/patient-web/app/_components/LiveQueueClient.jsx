"use client";

import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, Checkbox } from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";

/**
 * Phase 05: static snapshot of the queue from isolated mock data.
 * Phase 10 will replace polling/manual refresh with Socket.io
 * `queueUpdate` / `tokenCalled` events on room `queue:<doctorId>:<clinicId>`.
 */
export function LiveQueueClient({ snapshot }) {
  const [data] = useState(snapshot);
  const [audio, setAudio] = useState(false);

  const ahead = Math.max(data.myToken - data.currentToken, 0);
  const wait = ahead * data.avgConsultationMinutes;
  const statusMeta = {
    OPEN: { badge: "success", label: "Live queue open" },
    PAUSED: { badge: "warning", label: "Queue paused by doctor" },
    CLOSED: { badge: "neutral", label: "Queue closed" },
  }[data.status];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={data.doctor.name}
          subtitle={`${data.doctor.specialization} · ${data.clinic.clinicName}`}
          action={<Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>}
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-navy-50 p-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Now calling</p>
              <p className="mt-2 text-6xl font-black text-navy-900">{formatTokenNumber(data.currentToken)}</p>
            </div>
            <div className="rounded-xl bg-medical-50 p-6 text-center ring-1 ring-medical-200">
              <p className="text-xs font-medium uppercase tracking-wide text-medical-800">Your token</p>
              <p className="mt-2 text-6xl font-black text-medical-700">{formatTokenNumber(data.myToken)}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-200 px-4 py-3 text-sm">
            <p className="text-navy-800">
              <span className="font-semibold">{ahead}</span> patient{ahead === 1 ? "" : "s"} ahead · estimated wait{" "}
              <span className="font-semibold">{wait} min</span>
            </p>
            <Checkbox
              label="Sound alert when my token is called"
              checked={audio}
              onChange={(e) => setAudio(e.target.checked)}
            />
          </div>

          {ahead === 0 ? (
            <p className="mt-4 rounded-lg bg-status-completed-bg px-4 py-3 text-sm font-medium text-status-completed-text" role="status">
              You&apos;re next — please be ready at the consultation room.
            </p>
          ) : null}
        </CardBody>
      </Card>

      <p className="text-center text-xs text-navy-500">
        Live updates arrive automatically once realtime (Socket.io) is connected in a later phase.
      </p>
    </div>
  );
}
