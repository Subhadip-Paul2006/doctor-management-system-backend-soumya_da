// @doctor/api-client — in-memory access-token store (Phase 09).
//
// The access token lives in memory only (never localStorage/sessionStorage),
// per docs/FRONTEND_ARCHITECTURE.md §4.1. The refresh token is an httpOnly
// cookie owned entirely by the backend and is sent automatically via
// `credentials: "include"`. AuthProvider hydrates this store on mount (silent
// refresh) and clears it on logout; http-client reads it to attach the Bearer
// header and rewrites it after a 401→refresh.

let accessToken = null;
const listeners = new Set();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
  for (const fn of listeners) {
    // A misbehaving subscriber must never break token propagation.
    try {
      fn(accessToken);
    } catch {
      /* ignore listener errors */
    }
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

// Subscribe to token changes; returns an unsubscribe function.
export function subscribeAccessToken(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
