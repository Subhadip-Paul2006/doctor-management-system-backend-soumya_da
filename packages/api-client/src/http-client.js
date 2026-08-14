// @doctor/api-client — HTTP core with Bearer auth + single-flight 401 refresh (Phase 09).
//
// Extends the Phase 01 fetch wrapper WITHOUT breaking it: `request` still
// returns the parsed backend envelope ({ success, message, data }) and still
// keeps `credentials:"include"`. New in Phase 09:
//   • attaches `Authorization: Bearer <token>` from the in-memory token-store,
//   • on HTTP 401, performs ONE single-flight `POST /auth/refresh`, stores the
//     new access token, and retries the original request exactly once,
//   • rejects with a normalized `ApiError { status, message, errors[], data }`.
// No realtime/socket code lives here (that is Phase 10). No Zod here.

import { ApiError } from "./api-error.js";
import { getAccessToken, setAccessToken, clearAccessToken } from "./token-store.js";

export const DEFAULT_BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000/api/v1";

// These paths ARE the auth handshake — a 401 from them is a real credential
// error that must surface, never a trigger to refresh (which would recurse).
const NO_REFRESH_PATHS = ["/auth/refresh", "/auth/login", "/auth/register"];

// Single-flight guard: concurrent 401s await ONE shared refresh instead of each
// firing its own and racing to rotate the httpOnly refresh cookie.
let refreshPromise = null;

function joinUrl(baseUrl, path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path}`;
}

function isJsonBody(body) {
  // Objects/arrays are JSON-encoded; strings/FormData/Blob/etc. pass through.
  if (body == null || typeof body === "string") return false;
  if (typeof FormData !== "undefined" && body instanceof FormData) return false;
  if (typeof Blob !== "undefined" && body instanceof Blob) return false;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return false;
  if (typeof ArrayBuffer !== "undefined" && (body instanceof ArrayBuffer || ArrayBuffer.isView(body))) {
    return false;
  }
  return true;
}

async function parseBody(res) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function shouldRefresh(path, auth, retried, status) {
  if (status !== 401 || auth === false || retried) return false;
  return !NO_REFRESH_PATHS.some((p) => String(path).includes(p));
}

async function runRefresh(baseUrl) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(joinUrl(baseUrl, "/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new ApiError("Session expired", { status: res.status });
      const body = await parseBody(res);
      const token = body && body.data ? body.data.accessToken : null;
      if (!token) throw new ApiError("Session expired", { status: 401 });
      setAccessToken(token);
      return token;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Core request. Returns the parsed backend envelope; throws ApiError on failure.
 * options: { method, body, headers, baseUrl?, auth?=true, _retried?(internal), ...fetchInit }
 */
export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    baseUrl = DEFAULT_BASE_URL,
    auth = true,
    _retried = false,
    ...rest
  } = options;

  const finalHeaders = { Accept: "application/json", ...headers };

  let finalBody = body;
  if (isJsonBody(body)) {
    finalBody = JSON.stringify(body);
    if (!finalHeaders["Content-Type"] && !finalHeaders["content-type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
  }

  if (auth) {
    const token = getAccessToken();
    if (token && !finalHeaders.Authorization && !finalHeaders.authorization) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(joinUrl(baseUrl, path), {
      method,
      credentials: "include",
      headers: finalHeaders,
      ...(finalBody != null ? { body: finalBody } : {}),
      ...rest,
    });
  } catch (networkErr) {
    throw new ApiError((networkErr && networkErr.message) || "Network request failed", { status: 0 });
  }

  if (shouldRefresh(path, auth, _retried, res.status)) {
    try {
      await runRefresh(baseUrl);
    } catch {
      clearAccessToken();
      const errBody = await parseBody(res);
      throw new ApiError((errBody && errBody.message) || "Session expired. Please sign in again.", {
        status: 401,
        errors: (errBody && errBody.errors) || [],
        data: errBody,
      });
    }
    // Refresh succeeded — retry the original request exactly once.
    return request(path, { ...options, _retried: true });
  }

  const payload = await parseBody(res);

  if (!res.ok) {
    const message = (payload && payload.message) || res.statusText || `Request failed with status ${res.status}`;
    throw new ApiError(message, {
      status: res.status,
      errors: (payload && payload.errors) || [],
      data: payload,
    });
  }

  return payload;
}

// Back-compat convenience wrapper (unchanged surface from Phase 01) + `patch`.
export const httpClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
