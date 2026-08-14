// @doctor/api-client — clinicService (Phase 09).
// Maps to src/modules/clinic/* — the ENTIRE router is guarded by
// roleMiddleware("CLINIC"), so only a CLINIC-authenticated user may call these.
// No CLINIC-admin UI is in the Phase 09 wiring scope, but the service is
// provided for named completeness (roadmap Phase 9 service list) and future use.
// Verified paths:
//   getProfile        GET   /clinic/profile
//   updateProfile     PATCH /clinic/profile
//   listDoctors       GET   /clinic/doctors
//   editDoctor        PATCH /clinic/doctors/:doctorId   (accepts queueMode — the
//                          only queue-mode write path; CLINIC-only, not DOCTOR)
//   listReceptionists GET   /clinic/receptionists
//   getWorkingHours   GET   /clinic/working-hours
//   setWorkingHours   POST  /clinic/working-hours
//   listHolidays      GET   /clinic/holidays
import { request } from "../http-client.js";

const unwrap = (r) => (r && r.data ? r.data : null);

export const clinicService = {
  getProfile() {
    return request("/clinic/profile", { method: "GET" }).then(unwrap);
  },
  updateProfile(patch) {
    return request("/clinic/profile", { method: "PATCH", body: patch }).then(unwrap);
  },
  listDoctors() {
    return request("/clinic/doctors", { method: "GET" }).then(unwrap);
  },
  editDoctor(doctorId, patch) {
    return request(`/clinic/doctors/${encodeURIComponent(doctorId)}`, { method: "PATCH", body: patch }).then(unwrap);
  },
  listReceptionists() {
    return request("/clinic/receptionists", { method: "GET" }).then(unwrap);
  },
  getWorkingHours() {
    return request("/clinic/working-hours", { method: "GET" }).then(unwrap);
  },
  setWorkingHours(workingHours) {
    return request("/clinic/working-hours", { method: "POST", body: { workingHours } }).then(unwrap);
  },
  listHolidays() {
    return request("/clinic/holidays", { method: "GET" }).then(unwrap);
  },
};
