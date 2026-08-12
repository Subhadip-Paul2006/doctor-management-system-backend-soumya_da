"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { walkInRegistrationSchema } from "@doctor/types";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";
import { BOOKING_SOURCES, GENDERS, lookupPatientByPhone } from "../_data/receptionist";

/**
 * Phase 07: walk-in registration held in local state seeded from
 * `_data/receptionist.js`. Phase 09 persists via
 * POST /api/v1/receptionist/walk-in (confirmed contract). Phone lookup uses the
 * local patient directory; there is no confirmed patient-lookup endpoint, so a
 * real lookup is TO BE CONFIRMED WITH BACKEND TEAM.
 */
export function WalkInRegistration({ doctors }) {
  const availableDoctors = useMemo(
    () => doctors.filter((d) => d.status === "IN_SESSION" || d.status === "ON_BREAK"),
    [doctors]
  );

  const [form, setForm] = useState({
    phone: "",
    name: "",
    age: "",
    gender: "",
    address: "",
    doctorId: "",
    bookingSource: "WALK_IN",
    isEmergency: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lookupNote, setLookupNote] = useState(null);
  const [issued, setIssued] = useState(null); // { token, ...payload }

  const set = (key) => (e) => {
    const value = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: value }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
    setLookupNote(null);

    // Phone quick-fill from the local directory once a full number is present.
    if (value.length === 10) {
      const match = lookupPatientByPhone(value);
      if (match) {
        setForm((f) => ({
          ...f,
          phone: value,
          name: match.name,
          age: String(match.age),
          gender: match.gender,
          address: match.address || "",
        }));
        setLookupNote({ variant: "info", text: `Existing patient found — details pre-filled for ${match.name}.` });
      } else {
        setLookupNote({ variant: "neutral", text: "New patient — please complete the details below." });
      }
    }
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      doctorId: form.doctorId,
      name: form.name,
      phone: form.phone,
      age: form.age,
      gender: form.gender,
      address: form.address,
      bookingSource: form.bookingSource,
      isEmergency: form.isEmergency,
    };
    const parsed = walkInRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    // Simulate POST /api/v1/receptionist/walk-in round-trip: backend assigns the
    // next sequential token for the selected doctor's queue.
    await new Promise((r) => setTimeout(r, 600));
    const doctor = doctors.find((d) => d.id === parsed.data.doctorId);
    // Emergency cases are flagged for priority handling by the backend; the
    // actual position is set server-side. The mock still shows the issued token.
    const token = Math.floor(Math.random() * 20) + 8;
    setIssued({ ...parsed.data, doctor, token });
    setSubmitting(false);
  }

  function resetForNext() {
    setIssued(null);
    setForm({ phone: "", name: "", age: "", gender: "", address: "", doctorId: "", bookingSource: "WALK_IN", isEmergency: false });
    setErrors({});
    setLookupNote(null);
  }

  return (
    <>
      {issued ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-completed-bg text-status-completed-text" aria-hidden="true">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            <div>
              <h2 className="text-xl font-bold text-navy-900">Token issued</h2>
              <p className="mt-1 text-sm text-navy-500">{issued.name} has been added to {issued.doctor ? issued.doctor.name : "the doctor"}&apos;s queue.</p>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-medical-200 bg-medical-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-medical-800">Token</p>
              <p className="mt-1 text-5xl font-black text-medical-700">{formatTokenNumber(issued.token)}</p>
              <dl className="mt-4 space-y-1 text-left text-sm text-navy-800">
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Patient</dt><dd className="font-medium">{issued.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Phone</dt><dd className="font-medium">{issued.phone}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Doctor</dt><dd className="font-medium">{issued.doctor ? issued.doctor.name : "—"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Source</dt><dd className="font-medium">{issued.bookingSource}</dd></div>
                {issued.isEmergency ? <div className="flex justify-between gap-4"><dt className="text-navy-500">Priority</dt><dd className="font-medium text-rose-700">Emergency</dd></div> : null}
              </dl>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={resetForNext}>Register next patient</Button>
              <Link href="/receptionist/queue-desk"><Button variant="outline" size="sm">Open queue desk</Button></Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Walk-in registration" subtitle="Capture patient details and issue a queue token" />
          <CardBody>
            <form onSubmit={submit} noValidate className="space-y-5">
              {/* Phone lookup */}
              <div>
                <Input
                  label="Mobile number"
                  name="phone"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  error={errors.phone}
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                  hint="Enter a number to auto-fill returning patients."
                />
                {lookupNote ? (
                  <Alert variant={lookupNote.variant} className="mt-2 text-xs">{lookupNote.text}</Alert>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Patient full name"
                  name="name"
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
                  placeholder="e.g. Suresh Roy"
                  autoComplete="name"
                />
                <Input
                  label="Age"
                  name="age"
                  inputMode="numeric"
                  value={form.age}
                  onChange={set("age")}
                  error={errors.age}
                  placeholder="e.g. 45"
                />
                <Select label="Gender" name="gender" value={form.gender} onChange={set("gender")} error={errors.gender}>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </Select>
                <Select
                  label="Assign doctor"
                  name="doctorId"
                  value={form.doctorId}
                  onChange={set("doctorId")}
                  error={errors.doctorId}
                >
                  <option value="">Select doctor</option>
                  {availableDoctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Address (optional)"
                name="address"
                rows={2}
                value={form.address}
                onChange={set("address")}
                error={errors.address}
                placeholder="House / street / area"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Booking source" name="bookingSource" value={form.bookingSource} onChange={set("bookingSource")}>
                  {BOOKING_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <div className="flex items-end">
                  <Checkbox
                    label="Emergency — place at front of queue"
                    name="isEmergency"
                    checked={form.isEmergency}
                    onChange={set("isEmergency")}
                  />
                </div>
              </div>

              {form.isEmergency ? (
                <Alert variant="danger" title="Emergency priority">
                  This patient will be flagged as an emergency and moved ahead of standard tokens.
                </Alert>
              ) : null}

              <div className="flex justify-end border-t border-navy-200 pt-4">
                <Button type="submit" loading={submitting}>Register &amp; issue token</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </>
  );
}
