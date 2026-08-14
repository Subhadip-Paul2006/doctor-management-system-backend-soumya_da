// @doctor/api-client — doctorService (Phase 09).
// Maps to src/modules/doctor/* (verified routes; both require auth).
//   searchByName  GET /doctors/search?name=          (auth, any role; `name` required)
//   searchClinics GET /doctors/clinics/search?name=   (auth)
// NOTE: there is no public (unauthenticated) doctor list or `GET /doctors/:id`
// profile endpoint, so the public directory pages cannot use this service.
import { request } from "../http-client.js";

export const doctorService = {
  async searchByName(name) {
    const res = await request(`/doctors/search?name=${encodeURIComponent(name)}`, { method: "GET" });
    return (res && res.data) || null;
  },

  async searchClinics(name) {
    const res = await request(`/doctors/clinics/search?name=${encodeURIComponent(name)}`, { method: "GET" });
    return (res && res.data) || null;
  },
};
