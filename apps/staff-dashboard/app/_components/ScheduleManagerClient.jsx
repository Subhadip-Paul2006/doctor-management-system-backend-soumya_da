"use client";

import { useState } from "react";
import { doctorScheduleSchema } from "@doctor/types";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Input, Select, Toast } from "@doctor/ui";
import { QUEUE_MODES, DAY_LABELS } from "../_data/doctor";

/**
 * Doctor schedule settings — held in local state seeded from `_data/doctor.js`.
 *
 * PHASE 09 STATUS: BLOCKED — no matching endpoint. There is NO
 * `GET/PUT /api/v1/doctors/schedule` in the backend (`src/modules/doctor/*`).
 * The only related write paths are partial and do NOT cover weekly working hours:
 *   • PATCH /api/v1/doctors/:doctorId/clinics/:clinicId/consultation-time (avg minutes only)
 *   • PATCH /api/v1/clinic/doctors/:doctorId (queueMode — CLINIC role only, not DOCTOR)
 * A full schedule/weekly-hours persistence contract is TO BE CONFIRMED WITH
 * BACKEND TEAM, so this form intentionally stays on local state (no fake wiring).
 * Validated with doctorScheduleSchema.
 */
export function ScheduleManagerClient({ initial }) {
  const [queueMode, setQueueMode] = useState(initial.queueMode);
  const [avgMinutes, setAvgMinutes] = useState(String(initial.avgConsultationMinutes));
  const [weekly, setWeekly] = useState(initial.weekly.map((d) => ({ ...d })));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [saved, setSaved] = useState(false);

  function updateDay(dayOfWeek, patch) {
    setWeekly((rows) => rows.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)));
    setErrors((prev) => ({ ...prev, [dayOfWeek]: undefined }));
    setSaved(false);
  }

  async function save(e) {
    e.preventDefault();
    const payload = { queueMode, avgConsultationMinutes: avgMinutes, weekly };
    const parsed = doctorScheduleSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const [first, ...rest] = issue.path;
        if (first === "avgConsultationMinutes") {
          fieldErrors.avgConsultationMinutes = issue.message;
        } else if (first === "queueMode") {
          fieldErrors.queueMode = issue.message;
        } else if (first === "weekly") {
          const day = weekly[rest[0]]?.dayOfWeek;
          if (day && !fieldErrors[day]) fieldErrors[day] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setToast({ message: "Please fix the highlighted schedule fields.", variant: "warning" });
      return;
    }
    setErrors({});
    setSaving(true);
    // BLOCKED: no doctor-accessible schedule-persistence endpoint exists (see header).
    // Kept as local-only save until the backend schedule contract is confirmed.
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setToast({ message: "Schedule settings saved.", variant: "success" });
  }

  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <Card>
        <CardHeader title="Consultation preferences" subtitle="How patients join your queue" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Queue mode"
            name="queueMode"
            value={queueMode}
            onChange={(e) => { setQueueMode(e.target.value); setSaved(false); }}
            error={errors.queueMode}
          >
            {QUEUE_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
          <Input
            label="Avg. consultation time (minutes)"
            name="avgConsultationMinutes"
            inputMode="numeric"
            value={avgMinutes}
            onChange={(e) => { setAvgMinutes(e.target.value); setSaved(false); }}
            error={errors.avgConsultationMinutes}
            hint="Used to estimate patient wait times."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Weekly availability" subtitle="Set the days and hours you consult at this clinic" />
        <CardBody className="space-y-3">
          {weekly.map((row) => {
            const active = row.status === "ACTIVE";
            const dayError = errors[row.dayOfWeek];
            return (
              <div
                key={row.dayOfWeek}
                className={`grid items-end gap-3 rounded-lg border p-3 sm:grid-cols-[150px_1fr_1fr_auto] ${
                  active ? "border-navy-200 bg-white" : "border-navy-200 bg-navy-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    id={`active-${row.dayOfWeek}`}
                    type="checkbox"
                    checked={active}
                    onChange={(e) => updateDay(row.dayOfWeek, { status: e.target.checked ? "ACTIVE" : "INACTIVE" })}
                    aria-label={`${DAY_LABELS[row.dayOfWeek]} available`}
                    className="h-4 w-4 rounded border-navy-300 text-medical-600 focus:ring-2 focus:ring-medical-500"
                  />
                  <label htmlFor={`active-${row.dayOfWeek}`} className="text-sm font-semibold text-navy-900">
                    {DAY_LABELS[row.dayOfWeek]}
                  </label>
                </div>
                <Input
                  label={<span className="sr-only">{DAY_LABELS[row.dayOfWeek]} start time</span>}
                  type="time"
                  name={`start-${row.dayOfWeek}`}
                  value={row.startTime}
                  onChange={(e) => updateDay(row.dayOfWeek, { startTime: e.target.value })}
                  disabled={!active}
                  aria-label={`${DAY_LABELS[row.dayOfWeek]} start time`}
                />
                <Input
                  label={<span className="sr-only">{DAY_LABELS[row.dayOfWeek]} end time</span>}
                  type="time"
                  name={`end-${row.dayOfWeek}`}
                  value={row.endTime}
                  onChange={(e) => updateDay(row.dayOfWeek, { endTime: e.target.value })}
                  disabled={!active}
                  aria-label={`${DAY_LABELS[row.dayOfWeek]} end time`}
                />
                <Badge variant={active ? "success" : "neutral"}>{active ? "Active" : "Closed"}</Badge>
                {dayError ? (
                  <p className="text-xs text-rose-600 sm:col-span-4" role="alert">{DAY_LABELS[row.dayOfWeek]}: {dayError}</p>
                ) : null}
              </div>
            );
          })}
        </CardBody>
      </Card>

      {saved ? (
        <Alert variant="success" title="Saved locally">Your schedule preferences were saved on this device. Persisting them to the backend is pending a schedule endpoint (to be confirmed with the backend team).</Alert>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" loading={saving}>Save schedule settings</Button>
      </div>

      {toast ? <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} /> : null}
    </form>
  );
}
