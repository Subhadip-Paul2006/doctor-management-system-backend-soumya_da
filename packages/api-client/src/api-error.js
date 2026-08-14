// @doctor/api-client — normalized API error (Phase 09).
//
// Every failed request rejects with an ApiError so callers get a stable shape
// regardless of transport vs. backend-envelope failure. The backend error
// envelope is { success:false, message, errors:[{path,message}] } (see
// src/middlewares/error.middleware.js); Zod validation failures arrive as
// HTTP 400 "Validation failed" with per-field entries in `errors`.

export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], data = null } = {}) {
    super(message || "Request failed");
    this.name = "ApiError";
    this.status = status;
    // Always an array of { path, message } (path may be a string or array).
    this.errors = Array.isArray(errors) ? errors : [];
    this.data = data;
  }

  // True for network/transport failures (no HTTP response reached us).
  get isNetworkError() {
    return this.status === 0;
  }
}
