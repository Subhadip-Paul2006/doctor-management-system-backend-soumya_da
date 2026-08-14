// @doctor/api-client — authService (Phase 09).
// Maps the auth forms to src/modules/auth/* (verified route + controller shapes).
//   login    POST /auth/login            → { user, accessToken } (+ refresh cookie); stores token
//   register POST /auth/register         → { user } ONLY (no token) → caller routes to /login
//   forgot   POST /auth/forgot-password  → 200 message (non-revealing)
//   reset    POST /auth/reset-password   → 200 message (confirmPassword is client-only, stripped)
//   refresh  POST /auth/refresh          → { user, accessToken }; stores token
//   me       GET  /auth/me               → { user }
//   logout   POST /auth/logout           → 200; always clears the in-memory token
import { request } from "../http-client.js";
import { setAccessToken, clearAccessToken } from "../token-store.js";

// "YYYY-MM-DD" → ISO datetime, which the register validator (dob: datetime) expects.
function toIsoDob(dob) {
  return dob ? `${dob}T00:00:00.000Z` : undefined;
}

export const authService = {
  async login({ email, password }) {
    const res = await request("/auth/login", { method: "POST", body: { email, password } });
    const data = (res && res.data) || {};
    if (data.accessToken) setAccessToken(data.accessToken);
    return data;
  },

  async register({ name, email, password, phone, dob }) {
    const body = { name, email, password };
    if (phone) body.phone = phone; // empty phone omitted (backend treats it as optional)
    const iso = toIsoDob(dob);
    if (iso) body.dob = iso;
    const res = await request("/auth/register", { method: "POST", body });
    return (res && res.data) || {};
  },

  async forgotPassword({ email }) {
    return (await request("/auth/forgot-password", { method: "POST", body: { email } })) || {};
  },

  async resetPassword({ email, otp, newPassword }) {
    // confirmPassword is a client-only field — never sent to the backend.
    return (await request("/auth/reset-password", { method: "POST", body: { email, otp, newPassword } })) || {};
  },

  async refresh() {
    // auth:false — this IS the refresh handshake; never attach/renew via itself.
    const res = await request("/auth/refresh", { method: "POST", auth: false });
    const data = (res && res.data) || {};
    if (data.accessToken) setAccessToken(data.accessToken);
    return data;
  },

  async getMe() {
    const res = await request("/auth/me", { method: "GET" });
    return res && res.data ? res.data.user : null;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },
};
