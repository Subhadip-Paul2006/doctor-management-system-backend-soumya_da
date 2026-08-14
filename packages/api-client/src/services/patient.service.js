// @doctor/api-client — patientService (Phase 09).
// Maps to src/modules/patient/* (RECEPTIONIST/CLINIC for search+guest; PATIENT for /me).
//   searchByPhone GET   /patient/search?phone=  (RECEPTIONIST|CLINIC)
//   createGuest   POST  /patient/guest          (RECEPTIONIST|CLINIC) — 409 if phone exists
//   getMe         GET   /patient/me             (PATIENT)
//   updateMe      PATCH /patient/me             (PATIENT)
import { request } from "../http-client.js";

// Walk-in UI gender is lowercase (male/female/other); createGuestPatientSchema
// expects MALE|FEMALE|OTHER.
function toBackendGender(gender) {
  return gender ? String(gender).toUpperCase() : undefined;
}

export const patientService = {
  async searchByPhone(phone) {
    const res = await request(`/patient/search?phone=${encodeURIComponent(phone)}`, { method: "GET" });
    return (res && res.data) || null;
  },

  async createGuest({ name, age, phone, gender }) {
    const body = { name, age };
    if (phone) body.phone = phone;
    const g = toBackendGender(gender);
    if (g) body.gender = g;
    const res = await request("/patient/guest", { method: "POST", body });
    return (res && res.data) || null;
  },

  async getMe() {
    const res = await request("/patient/me", { method: "GET" });
    return (res && res.data) || null;
  },

  async updateMe(patch) {
    const res = await request("/patient/me", { method: "PATCH", body: patch });
    return (res && res.data) || null;
  },
};
