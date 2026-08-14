// @doctor/api-client — frontend API boundary.
//
// Phase 01 shipped a generic fetch wrapper (`httpClient`/`request`); Phase 09
// adds Bearer auth, single-flight 401→refresh, a normalized `ApiError`, and the
// modular API services described in docs/FRONTEND_ARCHITECTURE.md §3.2.
// Socket/realtime code is intentionally NOT here (that is Phase 10).
//
// The package `exports` map is root-only, so every consumer imports from
// "@doctor/api-client" — everything is re-exported through this file.

// --- HTTP core (back-compat surface preserved: `request` + `httpClient`) ---
export { request, httpClient, DEFAULT_BASE_URL } from "./src/http-client.js";
export { ApiError } from "./src/api-error.js";

// --- In-memory access-token store (access token never touches localStorage) ---
export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  subscribeAccessToken,
} from "./src/token-store.js";

// --- Error → form-state mapping helper ---
export { applyApiError, extractFieldErrors } from "./src/apply-api-error.js";

// --- Modular API services ---
export { authService } from "./src/services/auth.service.js";
export { patientService } from "./src/services/patient.service.js";
export { appointmentService } from "./src/services/appointment.service.js";
export { reviewService } from "./src/services/review.service.js";
export { doctorService } from "./src/services/doctor.service.js";
export { notificationService } from "./src/services/notification.service.js";
export { queueService } from "./src/services/queue.service.js";
export { clinicService } from "./src/services/clinic.service.js";
