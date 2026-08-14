// @doctor/api-client — appointmentService (Phase 09).
// Maps to src/modules/appointment/* (verified routes/validators).
//   bookOnline    POST /appointments/book/online     (PATIENT)         body ONLY { doctorId, clinicId, date }
//   bookReception POST /appointments/book/reception   (RECEPTIONIST|CLINIC)
//   searchDoctors GET  /appointments/doctors/search   (auth, any role)
//   listMine      GET  /appointments/me               (PATIENT)
import { request } from "../http-client.js";

function buildQuery(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v != null && v !== "") usp.append(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export const appointmentService = {
  async bookOnline({ doctorId, clinicId, date }) {
    // The online-booking validator accepts ONLY these three fields.
    const res = await request("/appointments/book/online", {
      method: "POST",
      body: { doctorId, clinicId, date },
    });
    return (res && res.data) || null;
  },

  async bookReception({ doctorId, clinicId, date, bookingSource, patientId, newPatient }) {
    const body = { doctorId, clinicId, date };
    if (bookingSource) body.bookingSource = bookingSource;
    if (patientId) body.patientId = patientId;
    if (newPatient) body.newPatient = newPatient;
    const res = await request("/appointments/book/reception", { method: "POST", body });
    return (res && res.data) || null;
  },

  async searchDoctors(filters) {
    const res = await request(`/appointments/doctors/search${buildQuery(filters)}`, { method: "GET" });
    return (res && res.data) || null;
  },

  async listMine() {
    const res = await request("/appointments/me", { method: "GET" });
    return (res && res.data) || null;
  },
};
