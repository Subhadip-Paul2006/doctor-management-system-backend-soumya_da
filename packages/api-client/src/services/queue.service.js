// @doctor/api-client — queueService (Phase 09).
// Maps to src/modules/queue/* (verified routes).
//
// IMPORTANT ROLE CONSTRAINT: the entire /queue router is guarded by
//   roleMiddleware("RECEPTIONIST", "CLINIC", "SUPER_ADMIN", "ADMIN")
// — the DOCTOR role is NOT permitted (a doctor-authenticated caller receives
// HTTP 403). So the doctor-facing queue UI cannot use this service; only the
// receptionist/clinic/admin surfaces can. Paths are UUID doctorId/clinicId and
// a "YYYY-MM-DD" date.
import { request } from "../http-client.js";

function base(doctorId, clinicId, date) {
  return `/queue/${encodeURIComponent(doctorId)}/${encodeURIComponent(clinicId)}/${encodeURIComponent(date)}`;
}
const unwrap = (r) => (r && r.data ? r.data : null);

export const queueService = {
  // GET /queue/:doctorId/:clinicId/:date
  getStatus(doctorId, clinicId, date) {
    return request(base(doctorId, clinicId, date), { method: "GET" }).then(unwrap);
  },
  // PATCH .../next — advance (prev COMPLETED, next CHECKED_IN)
  next(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/next`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../previous
  previous(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/previous`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../skip — marks next patient ABSENT
  skip(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/skip`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../recall — body { token } (the earlier token to bring back)
  recall(doctorId, clinicId, date, token) {
    return request(`${base(doctorId, clinicId, date)}/recall`, { method: "PATCH", body: { token } }).then(unwrap);
  },
  // PATCH .../pause
  pause(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/pause`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../resume
  resume(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/resume`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../close
  close(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/close`, { method: "PATCH" }).then(unwrap);
  },
  // PATCH .../reopen
  reopen(doctorId, clinicId, date) {
    return request(`${base(doctorId, clinicId, date)}/reopen`, { method: "PATCH" }).then(unwrap);
  },
  // POST .../emergency — body { patientId }
  addEmergency(doctorId, clinicId, date, patientId) {
    return request(`${base(doctorId, clinicId, date)}/emergency`, { method: "POST", body: { patientId } }).then(unwrap);
  },
};
