"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { appointmentBookingSchema } from "@doctor/types";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Radio,
  Select,
} from "@doctor/ui";
import { formatTokenNumber } from "@doctor/utils";

const STEPS = [
  { id: 1, label: "Date" },
  { id: 2, label: "Time" },
  { id: 3, label: "Patient" },
  { id: 4, label: "Confirm" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function Stepper({ current }) {
  return (
    <ol aria-label="Booking progress" className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? "bg-medical-600 text-white"
                  : done
                    ? "bg-medical-100 text-medical-800"
                    : "bg-navy-100 text-navy-500"
              }`}
            >
              {done ? "✓" : s.id}
            </span>
            <span className={`hidden text-xs font-medium sm:block ${active ? "text-navy-900" : "text-navy-500"}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 ? <span className="h-px w-5 bg-navy-200" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function BookingWizard({ doctor, dates, timeSlots, nextToken, existingPatient }) {
  const isLiveQueue = doctor.queueMode === "LIVE";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    date: "",
    timeSlot: "",
    bookingFor: "self",
    name: existingPatient?.name ?? "",
    phone: existingPatient?.phone ?? "",
    age: existingPatient?.age ?? "",
    gender: existingPatient?.gender ?? "",
  });

  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.date);
    if (step === 2) return isLiveQueue ? true : Boolean(form.timeSlot);
    if (step === 3) return true; // validated on Next
    return true;
  }, [step, form.date, form.timeSlot, isLiveQueue]);

  function validateStep3() {
    const parsed = appointmentBookingSchema.shape.patient.safeParse({
      bookingFor: form.bookingFor,
      name: form.name,
      phone: form.phone,
      age: form.age,
      gender: form.gender || undefined,
    });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  function next() {
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function confirm() {
    const payload = {
      doctorId: doctor.id,
      clinicId: doctor.clinic.id,
      date: form.date,
      timeSlot: isLiveQueue ? undefined : form.timeSlot,
      bookingSource: "ONLINE",
      patient: {
        bookingFor: form.bookingFor,
        name: form.name,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
      },
    };
    const parsed = appointmentBookingSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[issue.path.length - 1];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setStep(3);
      return;
    }

    setSubmitting(true);
    // PHASE 05: no live booking endpoint call yet (auth arrives in Phase 08,
    // wiring in Phase 09). Simulate the confirmed POST /api/v1/appointments
    // round-trip shape: backend assigns the next sequential token.
    await new Promise((r) => setTimeout(r, 700));
    const token = isLiveQueue ? nextToken.token : Math.floor(Math.random() * 20) + 5;
    setConfirmed({ ...parsed.data, token });
    setSubmitting(false);
  }

  // ----- Confirmation state (replaces the wizard) -----
  if (confirmed) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-completed-bg text-status-completed-text" aria-hidden="true">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <h2 className="text-xl font-bold text-navy-900">Appointment confirmed</h2>
            <p className="mt-1 text-sm text-navy-500">
              {isLiveQueue ? "Your live-queue token has been issued." : "Your time slot is reserved."}
            </p>
          </div>

          <div className="w-full max-w-sm rounded-xl border border-medical-200 bg-medical-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-medical-800">Your token</p>
            <p className="mt-1 text-5xl font-black text-medical-700">{formatTokenNumber(confirmed.token)}</p>
            <dl className="mt-4 space-y-1 text-left text-sm text-navy-800">
              <div className="flex justify-between gap-4"><dt className="text-navy-500">Doctor</dt><dd className="font-medium">{doctor.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-500">Clinic</dt><dd className="font-medium">{doctor.clinic.clinicName}</dd></div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">Date</dt>
                <dd className="font-medium">
                  {new Date(`${confirmed.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-navy-500">{isLiveQueue ? "Mode" : "Time"}</dt>
                <dd className="font-medium">{isLiveQueue ? "Live queue" : confirmed.timeSlot}</dd>
              </div>
              <div className="flex justify-between gap-4"><dt className="text-navy-500">Patient</dt><dd className="font-medium">{confirmed.patient.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-navy-500">Fee</dt><dd className="font-medium">₹{doctor.fee}</dd></div>
            </dl>
          </div>

          <Alert variant="info" className="w-full max-w-sm text-left">
            Arrive at the clinic a few minutes early and keep this token number handy. You can track the
            live queue from your dashboard.
          </Alert>

          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/dashboard"><Button size="sm">Go to dashboard</Button></Link>
            <Link href="/appointments"><Button variant="outline" size="sm">My appointments</Button></Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  // ----- Wizard -----
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          title="Book appointment"
          subtitle={`Step ${step} of ${STEPS.length} — ${STEPS[step - 1].label}`}
          action={<Stepper current={step} />}
        />
        <CardBody>
          {/* STEP 1 — Date */}
          {step === 1 ? (
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-navy-800">Select a date</legend>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Appointment date">
                {dates.map((d) => {
                  const selected = form.date === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set("date")(d.value)}
                      className={`flex flex-col items-center rounded-lg border px-2 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                        selected
                          ? "border-medical-600 bg-medical-50 text-medical-800"
                          : "border-navy-200 bg-white text-navy-700 hover:border-medical-200 hover:bg-medical-50"
                      }`}
                    >
                      <span className="text-[11px] font-medium uppercase">{d.dayName}</span>
                      <span className="text-lg font-bold">{d.dayNum}</span>
                      <span className="text-[11px] text-navy-500">{d.isToday ? "Today" : d.month}</span>
                    </button>
                  );
                })}
              </div>
              {errors.date ? <p className="mt-2 text-xs text-rose-600">{errors.date}</p> : null}
            </fieldset>
          ) : null}

          {/* STEP 2 — Time / queue mode */}
          {step === 2 ? (
            isLiveQueue ? (
              <div>
                <Alert variant="info" title="Live queue token">
                  {doctor.name} runs a live queue at {doctor.clinic.clinicName}. Booking assigns you the next
                  available token instead of a fixed clock time — you consult in token order.
                </Alert>
                <div className="mt-4 rounded-lg border border-navy-200 bg-navy-50 p-4 text-sm text-navy-800">
                  Estimated next token: <span className="font-bold text-medical-700">{formatTokenNumber(nextToken.token)}</span>
                  <span className="ml-2 text-navy-500">(~{nextToken.estimatedWaitMinutes} min estimated wait)</span>
                </div>
              </div>
            ) : (
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-navy-800">Select a time slot</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Time slot">
                  {timeSlots.map((s) => {
                    const selected = form.timeSlot === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!s.available}
                        onClick={() => set("timeSlot")(s.value)}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 ${
                          !s.available
                            ? "cursor-not-allowed border-navy-200 bg-navy-50 text-navy-300 line-through"
                            : selected
                              ? "border-medical-600 bg-medical-50 text-medical-800"
                              : "border-navy-200 bg-white text-navy-700 hover:border-medical-200 hover:bg-medical-50"
                        }`}
                      >
                        {s.value}
                      </button>
                    );
                  })}
                </div>
                {errors.timeSlot ? <p className="mt-2 text-xs text-rose-600">{errors.timeSlot}</p> : null}
              </fieldset>
            )
          ) : null}

          {/* STEP 3 — Patient details */}
          {step === 3 ? (
            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-navy-800">Who is this appointment for?</legend>
                <div className="flex gap-4">
                  <Radio
                    name="bookingFor"
                    label="Myself"
                    value="self"
                    checked={form.bookingFor === "self"}
                    onChange={() => set("bookingFor")("self")}
                  />
                  <Radio
                    name="bookingFor"
                    label="A family member"
                    value="family"
                    checked={form.bookingFor === "family"}
                    onChange={() => set("bookingFor")("family")}
                  />
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Patient full name"
                  name="name"
                  value={form.name}
                  onChange={set("name")}
                  error={errors.name}
                  placeholder="e.g. Anil Kumar"
                  autoComplete="name"
                />
                <Input
                  label="Mobile number"
                  name="phone"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={set("phone")}
                  error={errors.phone}
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                />
                <Input
                  label="Age"
                  name="age"
                  inputMode="numeric"
                  value={form.age}
                  onChange={set("age")}
                  error={errors.age}
                  placeholder="e.g. 34"
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={set("gender")}
                  error={errors.gender}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          ) : null}

          {/* STEP 4 — Summary */}
          {step === 4 ? (
            <div className="space-y-4">
              <dl className="space-y-2 rounded-lg border border-navy-200 bg-navy-50 p-4 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Doctor</dt><dd className="font-medium text-navy-900">{doctor.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Specialization</dt><dd className="text-navy-800">{doctor.specialization}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Clinic</dt><dd className="text-navy-800">{doctor.clinic.clinicName}, {doctor.clinic.city}</dd></div>
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-500">Date</dt>
                  <dd className="font-medium text-navy-900">
                    {new Date(`${form.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-navy-500">{isLiveQueue ? "Mode" : "Slot"}</dt>
                  <dd className="font-medium text-navy-900">{isLiveQueue ? "Live queue token" : form.timeSlot}</dd>
                </div>
                <div className="flex justify-between gap-4"><dt className="text-navy-500">Patient</dt><dd className="text-navy-800">{form.name} · {form.age} yrs · {GENDERS.find((g) => g.value === form.gender)?.label ?? ""}</dd></div>
                <div className="flex justify-between gap-4 border-t border-navy-200 pt-2">
                  <dt className="text-navy-500">Consultation fee</dt>
                  <dd className="font-bold text-navy-900">₹{doctor.fee}</dd>
                </div>
              </dl>
              <Alert variant="neutral">
                By confirming, an appointment will be created with booking source <strong>ONLINE</strong>. The clinic
                may contact you on <strong>{form.phone}</strong> about this visit.
              </Alert>
            </div>
          ) : null}

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-navy-200 pt-4">
            {step > 1 ? (
              <Button variant="ghost" size="sm" onClick={back}>Back</Button>
            ) : (
              <span />
            )}
            {step < STEPS.length ? (
              <Button size="sm" onClick={next} disabled={!canContinue}>
                Continue
              </Button>
            ) : (
              <Button size="sm" onClick={confirm} loading={submitting}>
                {isLiveQueue ? "Confirm & generate token" : "Confirm booking"}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Side summary */}
      <aside className="h-fit lg:sticky lg:top-20">
        <Card>
          <CardBody className="space-y-3 p-5">
            <div className="flex items-start gap-3">
              <Avatar name={doctor.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy-900">{doctor.name}</p>
                <p className="text-xs text-navy-500">{doctor.qualification}</p>
                <p className="text-xs text-navy-700">{doctor.specialization}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={isLiveQueue ? "info" : "neutral"}>{isLiveQueue ? "Live queue" : "Time slot"}</Badge>
              <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs text-navy-700">Fee ₹{doctor.fee}</span>
            </div>
            <p className="border-t border-navy-200 pt-3 text-xs text-navy-500">
              {doctor.clinic.clinicName}, {doctor.clinic.city} · {doctor.timings}
            </p>
            <Link href={`/doctors/${doctor.id}`} className="text-xs font-medium text-medical-700 hover:underline">
              View doctor profile
            </Link>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
