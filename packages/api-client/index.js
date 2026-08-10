// @doctor/api-client — frontend API boundary (Phase 01 foundation).
// Generic fetch-based HTTP client. Endpoint-specific services (authService,
// doctorService, ...) are added in Phase 09 per docs/BACKEND_FRONTEND_CONTRACT.md.
// Socket client intentionally NOT implemented here (Phase 10).

const DEFAULT_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000/api/v1";

async function request(path, { method = "GET", body, headers = {}, ...rest } = {}) {
  const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: "include",
    ...rest,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error((data && data.message) || `Request failed: ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const httpClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export { request };
