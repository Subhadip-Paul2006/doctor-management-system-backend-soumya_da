// PHASE 07 MOCK DATA — receptionist front-desk application (apps/staff-dashboard).
//
// WHY THIS EXISTS: The receptionist-scope endpoints this phase maps to
//   GET  /api/v1/receptionist/doctors    (doctors present in this clinic today)
//   GET  /api/v1/receptionist/dashboard  (front-desk summary stats)
//   POST /api/v1/receptionist/walk-in    (register walk-in + issue token)
//   PUT  /api/v1/appointments/:id/status (mark CHECKED_IN)
// exist per docs/BACKEND_FRONTEND_CONTRACT.md §2.4/§2.5 but are behind JWT auth,
// and authentication is Phase 08 (API wiring is Phase 09). This module is the
// isolated UI data source for Phase 07 so the reception desk is fully usable now
// and can be swapped to @doctor/api-client in Phase 09 without UI changes.
//
// SHAPES mirror the Prisma Receptionist / ReceptionistDoctor / Queue /
// Appointment / Patient models (appointment.status: WAITING | CHECKED_IN |
// COMPLETED | CANCELLED | ABSENT; bookingSource: WALK_IN | PHONE | ONLINE |
// RECEPTION; queue.status: OPEN | PAUSED | CLOSED).
//
// ⚠️ MOCK CONTENT — not real patient/queue data. Realtime socket events
//    (queueUpdate, tokenCalled) are Phase 10.

// Front-desk context: this receptionist's clinic + the doctors they manage today.
export function getFrontDeskContext() {
  return {
    receptionist: { id: "r1", name: "Kavita Sharma" },
    clinic: { id: "c1", clinicName: "Apollo Clinic", city: "Salt Lake" },
    // Doctors present today (ReceptionistDoctor mapping), with live status.
    doctors: [
      { id: "d1", name: "Dr. Subhas Mukherjee", specialization: "Cardiologist", status: "IN_SESSION" },
      { id: "d5", name: "Dr. Rahul Chatterjee", specialization: "Pediatrician", status: "ON_BREAK" },
    ],
  };
}

// Front-desk summary for today.
export function getFrontDeskSummary() {
  return {
    walkInsToday: 9,
    checkedInToday: 6,
    tokensIssuedToday: 17,
    queuesOpen: 1,
  };
}

// Per-doctor live queue for the check-in desk (Queue + today's token list).
export function getQueueForDoctor(doctorId) {
  const queues = {
    d1: {
      doctor: { id: "d1", name: "Dr. Subhas Mukherjee", specialization: "Cardiologist" },
      status: "OPEN", // OPEN | PAUSED | CLOSED
      currentToken: 12,
      lastTokenIssued: 17,
      tokens: [
        { id: "t5", token: 12, patient: "Anil Kumar", phone: "9876543210", status: "CHECKED_IN", bookingSource: "ONLINE", isEmergency: false },
        { id: "t6", token: 13, patient: "Soma Banerjee", phone: "9830012001", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
        { id: "t7", token: 14, patient: "Rahul Verma", phone: "9830012002", status: "WAITING", bookingSource: "WALK_IN", isEmergency: true },
        { id: "t8", token: 15, patient: "Priya Nair", phone: "9830012003", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
        { id: "t9", token: 16, patient: "Arjun Sen", phone: "9830012004", status: "WAITING", bookingSource: "PHONE", isEmergency: false },
        { id: "t10", token: 17, patient: "Meera Iyer", phone: "9830012005", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
      ],
    },
    d5: {
      doctor: { id: "d5", name: "Dr. Rahul Chatterjee", specialization: "Pediatrician" },
      status: "PAUSED",
      currentToken: 3,
      lastTokenIssued: 8,
      tokens: [
        { id: "p3", token: 3, patient: "Baby Aarav", phone: "9830012101", status: "CHECKED_IN", bookingSource: "WALK_IN", isEmergency: false },
        { id: "p4", token: 4, patient: "Riya Das", phone: "9830012102", status: "WAITING", bookingSource: "ONLINE", isEmergency: false },
        { id: "p5", token: 5, patient: "Kabir Bose", phone: "9830012103", status: "WAITING", bookingSource: "WALK_IN", isEmergency: false },
      ],
    },
  };
  return queues[doctorId] || null;
}

// Existing patient directory for the walk-in phone-lookup (Patient model fields).
export function lookupPatientByPhone(phone) {
  const directory = [
    { phone: "9876543210", name: "Anil Kumar", age: 34, gender: "male", address: "Salt Lake, Kolkata" },
    { phone: "9830098300", name: "Suresh Roy", age: 45, gender: "male", address: "Howrah" },
    { phone: "9830012003", name: "Priya Nair", age: 30, gender: "female", address: "New Town, Kolkata" },
  ];
  return directory.find((p) => p.phone === phone) || null;
}

export const BOOKING_SOURCES = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone" },
  { value: "RECEPTION", label: "Reception" },
];

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];
