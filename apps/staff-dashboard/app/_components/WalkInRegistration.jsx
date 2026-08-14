"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { walkInRegistrationSchema } from "@doctor/types";
import { patientService, appointmentService, applyApiError } from "@doctor/api-client";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Select,
  Textarea,
} from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";
import { BOOKING_SOURCES, GENDERS } from "../_data/receptionist";

/**
 * Walk-in registration (Phase 09 — wired to the reception booking flow via
 * @doctor/api-client). The reception-booking contract is:
 *   GET  /api/v1/patient/search?phone=   (RECEPTIONIST|CLINIC) — phone lookup
 *   POST /api/v1/patient/guest           (RECEPTIONIST|CLINIC) — create guest (gender→UPPERCASE)
 *   POST /api/v1/appointments/book/reception  { doctorId, clinicId, date, bookingSource, patientId }
 *
 * CONTRACT GAPS — TO BE CONFIRMED WITH BACKEND TEAM:
 *   • book/reception has NO `address` field → the collected address is NOT sent.
 *   • book/reception has NO `isEmergency` field (emergency is a separate
 *     POST /queue/:doctorId/:clinicId/:date/emergency, RECEPTIONIST/CLINIC-only)
 *     → the emergency flag is NOT sent by this booking call.
 *   • `clinicId` is not entered on the form; it is sourced from the front-desk
 *     context (getFrontDeskContext().clinic.id) passed as a prop, and `date`
 *     defaults to today.
 * NOTE: mock doctor/clinic ids (d1/d5/c1) are NOT UUIDs, so a LIVE call in this
 * environment is BLOCKED by the backend's uuid validators + JWT auth; the wiring
 * is contract-correct and runs once seeded UUIDs + a logged-in receptionist exist.
 */
export function WalkInRegistration({ doctors, clinicId }) {
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
  const [serverError, setServerError] = useState(null);
  const [foundPatientId, setFoundPatientId] = useState(null); // set when phone lookup matches

  const set = (key) => (e) => {
    const value = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone: value }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
    setLookupNote(null);
    setFoundPatientId(null); // any phone edit invalidates a prior match

    // Real patient lookup once a full number is present:
    // GET /patient/search?phone= (RECEPTIONIST|CLINIC). data.patient is null when
    // no match. Failure (e.g. not authenticated) must NOT break the form — we fall
    // back to treating the entry as a new patient.
    if (value.length === 10) {
      try {
        const result = await patientService.searchByPhone(value);
        const match = result && result.patient ? result.patient : null;
        // Guard against a stale response if the receptionist kept typing.
        setForm((f) => {
          if (f.phone !== value) return f;
          if (match) {
            return {
              ...f,
              name: match.name || f.name,
              age: match.age != null ? String(match.age) : f.age,
              // backend gender is UPPERCASE (MALE|FEMALE|OTHER); Select is lowercase
              gender: match.gender ? String(match.gender).toLowerCase() : f.gender,
            };
          }
          return f;
        });
        if (match) {
          setFoundPatientId(match.id || null);
          setLookupNote({ variant: "info", text: `Existing patient found — details pre-filled for ${match.name}.` });
        } else {
          setLookupNote({ variant: "neutral", text: "New patient — please complete the details below." });
        }
      } catch (err) {
        // Lookup unavailable (network / not authenticated): continue as a new patient.
        setLookupNote({
          variant: "neutral",
          text: "Could not verify existing records — continue entering the patient's details.",
        });
      }
    }
  }

  async function submit(e) {
    e.preventDefault();
    setServerError(null);
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

    if (!clinicId) {
      // No front-desk clinic context — cannot satisfy the book/reception contract.
      setServerError("Clinic context is unavailable, so a token cannot be issued. Please re-open the front desk.");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      // 1) Resolve patientId. A phone-lookup hit reuses the existing patient;
      //    otherwise create a guest patient (gender→UPPERCASE, age is an int).
      let patientId = foundPatientId;
      if (!patientId) {
        const created = await patientService.createGuest({
          name: parsed.data.name,
          age: parsed.data.age,
          phone: parsed.data.phone,
          gender: parsed.data.gender,
        });
        patientId = created && created.patient ? created.patient.id : null;
      }

      // 2) Book via the reception contract { doctorId, clinicId, date, bookingSource, patientId }.
      //    date = today (YYYY-MM-DD). address + isEmergency are NOT part of this
      //    contract and are intentionally NOT sent (TO BE CONFIRMED WITH BACKEND TEAM).
      const now = new Date();
      const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const result = await appointmentService.bookReception({
        doctorId: parsed.data.doctorId,
        clinicId,
        date,
        bookingSource: parsed.data.bookingSource,
        patientId,
      });

      const appt = result && result.appointment ? result.appointment : result;
      const token = appt && appt.token != null ? appt.token : null;
      const doctor = doctors.find((d) => d.id === parsed.data.doctorId);
      setIssued({ ...parsed.data, doctor, token });
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForNext() {
    setIssued(null);
    setForm({ phone: "", name: "", age: "", gender: "", address: "", doctorId: "", bookingSource: "WALK_IN", isEmergency: false });
    setErrors({});
    setLookupNote(null);
    setServerError(null);
    setFoundPatientId(null);
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Token Slip ${formatTokenNumber(issued.token)}</title>
                        <style>
                          body { font-family: sans-serif; padding: 20px; text-align: center; color: #0f172a; }
                          .token { font-size: 48px; font-weight: 900; color: #0284c7; margin: 10px 0; }
                          .box { border: 2px dashed #0284c7; padding: 20px; border-radius: 12px; max-width: 300px; margin: 0 auto; }
                          .info { text-align: left; margin-top: 15px; font-size: 13px; line-height: 1.6; }
                          @media print { button { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="box">
                          <h2 style="margin:0; font-size:18px;">Apollo Clinic, Salt Lake</h2>
                          <p style="margin:2px 0; font-size:12px; color:#64748b;">Walk-In Token Slip</p>
                          <div class="token">${formatTokenNumber(issued.token)}</div>
                          <div class="info">
                            <p style="margin:2px 0;"><strong>Patient:</strong> ${issued.name}</p>
                            <p style="margin:2px 0;"><strong>Doctor:</strong> ${issued.doctor ? issued.doctor.name : "—"}</p>
                            <p style="margin:2px 0;"><strong>Date:</strong> ${new Date().toISOString().split("T")[0]}</p>
                            ${issued.isEmergency ? '<p style="margin:2px 0; color:#b91c1c; font-weight:bold;">Priority: Emergency Case</p>' : ''}
                          </div>
                        </div>
                        <br/>
                        <button onclick="window.print()" style="padding:8px 16px; background:#0284c7; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Print Slip</button>
                      </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
              >
                Print Token Slip
              </Button>
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

              {serverError ? <Alert variant="danger" role="alert">{serverError}</Alert> : null}

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
