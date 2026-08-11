// PHASE 05 MOCK DATA — patient portal / appointment experience.
//
// WHY THIS EXISTS: The patient-scoped endpoints this phase maps to
//   GET /api/v1/patient/my-appointments
//   GET /api/v1/appointments/:id
//   GET /api/v1/queue/today
//   POST /api/v1/appointments        (booking)
//   POST /api/v1/reviews             (review submit)
// exist per docs/BACKEND_FRONTEND_CONTRACT.md §2.3/§2.5/§2.6/§2.9 but are
// behind JWT auth, and authentication is Phase 08. This module is the
// isolated UI data source for Phase 05 so the booking flow, dashboard,
// appointment history and live-queue tracker are fully usable now and can
// be swapped to @doctor/api-client in Phase 09 without UI changes.
//
// SHAPES mirror the Appointment / Queue / Patient Prisma models
// (status: WAITING | CHECKED_IN | COMPLETED | CANCELLED | ABSENT;
//  bookingSource: ONLINE | WALK_IN | PHONE | RECEPTION).
//
// ⚠️ MOCK CONTENT — not real appointment/medical data. Dates are resolved
//    relative to "today" at call time so the UI is always coherent.

import { getDoctorById } from "./directory";

const DAYS = 24 * 60 * 60 * 1000;

function toISODate(offsetDays) {
  const d = new Date(Date.now() + offsetDays * DAYS);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function withDoctor(seed) {
  const doctor = getDoctorById(seed.doctorId) || null;
  return { ...seed, doctor };
}

const APPOINTMENT_SEEDS = [
  // Active / upcoming
  { id: "a1", doctorId: "d1", token: 14, dateOffset: 0, time: "6:30 PM", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
  { id: "a2", doctorId: "d2", token: 6, dateOffset: 2, time: "10:30 AM", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
  // History
  { id: "a3", doctorId: "d4", token: 9, dateOffset: -6, time: "11:30 AM", status: "COMPLETED", bookingSource: "ONLINE", isEmergency: false, reviewed: false },
  { id: "a4", doctorId: "d3", token: 4, dateOffset: -13, time: "5:00 PM", status: "COMPLETED", bookingSource: "WALK_IN", isEmergency: false, reviewed: true, myRating: 5, myReview: "Painless root canal. Clear explanation of the procedure and costs upfront." },
  { id: "a5", doctorId: "d5", token: 11, dateOffset: -20, time: "7:00 PM", status: "CANCELLED", bookingSource: "ONLINE", isEmergency: false, reviewed: false },
  { id: "a6", doctorId: "d1", token: 7, dateOffset: -34, time: "6:00 PM", status: "ABSENT", bookingSource: "ONLINE", isEmergency: false, reviewed: false },
  { id: "a7", doctorId: "d6", token: 3, dateOffset: -41, time: "9:30 AM", status: "COMPLETED", bookingSource: "PHONE", isEmergency: false, reviewed: false },
];

/** List the current patient's appointments (mock for GET /api/v1/patient/my-appointments). */
export function listMyAppointments() {
  return APPOINTMENT_SEEDS.map((s) => ({
    ...withDoctor(s),
    date: toISODate(s.dateOffset),
  }));
}

/** One appointment by id (mock for GET /api/v1/appointments/:id). */
export function getAppointmentById(id) {
  return listMyAppointments().find((a) => a.id === id) || null;
}

/** Upcoming = future-dated, not cancelled/absent. */
export function getUpcomingAppointments() {
  return listMyAppointments().filter(
    (a) => a.dateOffset >= 0 && (a.status === "WAITING" || a.status === "CHECKED_IN")
  );
}

/** Reviews I have already submitted (from completed appointments). */
export function listMyReviews() {
  return listMyAppointments()
    .filter((a) => a.reviewed && a.myRating != null)
    .map((a) => ({
      id: `r-${a.id}`,
      appointmentId: a.id,
      doctor: a.doctor,
      rating: a.myRating,
      comment: a.myReview,
      date: a.date,
    }));
}

/** Completed appointments that can still be reviewed. */
export function listReviewableAppointments() {
  return listMyAppointments().filter((a) => a.status === "COMPLETED" && !a.reviewed);
}

// ---------------------------------------------------------------------------
// Live queue (mock for GET /api/v1/queue/today — realtime events are Phase 10)
// ---------------------------------------------------------------------------

/** Today's queue for the active (today's WAITING) appointment, or null. */
export function getActiveQueueSnapshot() {
  const active = listMyAppointments().find((a) => a.dateOffset === 0 && a.status === "WAITING");
  if (!active || !active.doctor) return null;
  return {
    appointmentId: active.id,
    myToken: active.token,
    currentToken: 10,
    lastTokenIssued: 17,
    status: "OPEN", // OPEN | PAUSED | CLOSED (QueueStatus enum)
    avgConsultationMinutes: 15,
    doctor: active.doctor,
    clinic: active.doctor.clinic,
  };
}

// ---------------------------------------------------------------------------
// Booking availability (isolated mock — NOT from a backend availability API.
// There is NO confirmed backend slot-availability endpoint; the booking payload
// per the contract is only { doctorId, clinicId, date, bookingSource }.
// These date/slot options are illustrative UI data pending backend confirmation.)
// ---------------------------------------------------------------------------

/** Next `count` selectable dates (skips nothing — purely illustrative). */
export function listAvailableDates(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.now() + i * DAYS);
    return {
      value: toISODate(i),
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      isToday: i === 0,
    };
  });
}

/** Illustrative time slots for TIME_SLOT doctors; a few flagged unavailable. */
export function listTimeSlots() {
  return [
    { value: "10:00 AM", available: true },
    { value: "10:30 AM", available: false },
    { value: "11:00 AM", available: true },
    { value: "11:30 AM", available: true },
    { value: "12:00 PM", available: false },
    { value: "5:00 PM", available: true },
    { value: "5:30 PM", available: true },
    { value: "6:00 PM", available: false },
    { value: "6:30 PM", available: true },
  ];
}

/** Estimated next token for LIVE queue doctors (illustrative). */
export function getNextTokenEstimate() {
  return { token: 18, estimatedWaitMinutes: 45 };
}
