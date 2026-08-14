// @doctor/api-client — reviewService (Phase 09).
// Maps to src/modules/review/* (verified routes).
//   create        POST /reviews             (PATIENT) { appointmentId(uuid), rating(1-5), comment? }
//   listForDoctor GET  /reviews/doctor/:id  (auth)
//   listForClinic GET  /reviews/clinic/:id  (auth)
import { request } from "../http-client.js";

export const reviewService = {
  async create({ appointmentId, rating, comment }) {
    const body = { appointmentId, rating };
    if (comment) body.comment = comment;
    const res = await request("/reviews", { method: "POST", body });
    return (res && res.data) || null;
  },

  async listForDoctor(doctorId) {
    const res = await request(`/reviews/doctor/${encodeURIComponent(doctorId)}`, { method: "GET" });
    return (res && res.data) || null;
  },

  async listForClinic(clinicId) {
    const res = await request(`/reviews/clinic/${encodeURIComponent(clinicId)}`, { method: "GET" });
    return (res && res.data) || null;
  },
};
