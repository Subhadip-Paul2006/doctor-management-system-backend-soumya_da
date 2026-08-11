// PHASE 06 MOCK DATA — doctor dashboard application (apps/staff-dashboard).
//
// WHY THIS EXISTS: The doctor-scope endpoints this phase maps to
//   GET  /api/v1/queue/today        (today's Queue for doctor+clinic)
//   POST /api/v1/queue/next         (advance current token)
//   PUT  /api/v1/queue/status       (OPEN | PAUSED | CLOSED)
//   GET  /api/v1/doctors/schedule
//   PUT  /api/v1/doctors/schedule   (weekly hours, queueMode, avgConsultationMinutes)
// exist per docs/BACKEND_FRONTEND_CONTRACT.md §2.2/§2.6 but are behind JWT auth,
// and authentication is Phase 08 (API wiring is Phase 09). This module is the
// isolated UI data source for Phase 06 so the doctor console, dashboard and
// schedule manager are fully usable now and can be swapped to
// @doctor/api-client in Phase 09 without UI changes.
//
// SHAPES mirror the Prisma Queue / Appointment / DoctorClinicAssociation models
// (queue.status: OPEN | PAUSED | CLOSED; appointment.status: WAITING |
// CHECKED_IN | COMPLETED | CANCELLED | ABSENT; bookingSource: ONLINE |
// WALK_IN | PHONE | RECEPTION; queueMode: LIVE | TIME_SLOT | PRIVATE).
//
// ⚠️ MOCK CONTENT — not real patient/queue data. Realtime socket events
//    (queueUpdate, tokenCalled, appointmentCompleted) are Phase 10.

// Today's queue snapshot (Queue model + today's token list).
export function getTodayQueue() {
  return {
    doctor: { id: "d1", name: "Dr. Subhas Mukherjee", specialization: "Cardiologist" },
    clinic: { id: "c1", clinicName: "Apollo Clinic", city: "Salt Lake" },
    currentToken: 12,
    lastTokenIssued: 17,
    status: "OPEN", // OPEN | PAUSED | CLOSED (QueueStatus enum)
    avgConsultationMinutes: 15,
    // Appointments/token list for today (token order = queue order).
    tokens: [
      { id: "t5", token: 12, patient: "Anil Kumar", age: 34, gender: "Male", status: "CHECKED_IN", bookingSource: "ONLINE", isEmergency: false },
      { id: "t6", token: 13, patient: "Soma Banerjee", age: 28, gender: "Female", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
      { id: "t7", token: 14, patient: "Rahul Verma", age: 41, gender: "Male", status: "WAITING", bookingSource: "WALK_IN", isEmergency: true },
      { id: "t8", token: 15, patient: "Priya Nair", age: 30, gender: "Female", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
      { id: "t9", token: 16, patient: "Arjun Sen", age: 52, gender: "Male", status: "WAITING", bookingSource: "PHONE", isEmergency: false },
      { id: "t10", token: 17, patient: "Meera Iyer", age: 26, gender: "Female", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
    ],
    completedToday: 11,
  };
}

// Doctor's weekly schedule & preferences (Doctor + DoctorClinicAssociation).
export function getDoctorSchedule() {
  return {
    doctorId: "d1",
    clinicId: "c1",
    queueMode: "LIVE", // LIVE | TIME_SLOT | PRIVATE (QueueMode enum)
    avgConsultationMinutes: 15,
    // Weekly rows — every Prisma DayOfWeek, with start/end or closed.
    weekly: [
      { dayOfWeek: "MONDAY", startTime: "18:00", endTime: "21:00", status: "ACTIVE" },
      { dayOfWeek: "TUESDAY", startTime: "18:00", endTime: "21:00", status: "ACTIVE" },
      { dayOfWeek: "WEDNESDAY", startTime: "18:00", endTime: "21:00", status: "ACTIVE" },
      { dayOfWeek: "THURSDAY", startTime: "18:00", endTime: "21:00", status: "ACTIVE" },
      { dayOfWeek: "FRIDAY", startTime: "18:00", endTime: "21:00", status: "ACTIVE" },
      { dayOfWeek: "SATURDAY", startTime: "10:00", endTime: "13:00", status: "ACTIVE" },
      { dayOfWeek: "SUNDAY", startTime: "", endTime: "", status: "INACTIVE" },
    ],
  };
}

export const QUEUE_MODES = [
  { value: "LIVE", label: "Live queue (token order)" },
  { value: "TIME_SLOT", label: "Time slot (fixed clock time)" },
  { value: "PRIVATE", label: "Private (by appointment only)" },
];

export const QUEUE_STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
];

export const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};
