"use client";

// Staff-dashboard auth state (Phase 09 — minimal client auth context for the
// unified staff login: Doctor / Receptionist / Clinic / Admin / Super Admin).
//
// Access token lives in @doctor/api-client's in-memory token-store; the refresh
// token is an httpOnly cookie owned by the backend. On mount we attempt a silent
// session restore (refresh → getMe). Post-login routing is role-based via
// roleHomePath() below.
//
// NOTE: full role-based route guards (e.g. blocking a RECEPTIONIST from /doctor/*)
// are Phase 8 scope and are intentionally NOT implemented here — see the Phase 09
// report "Deviations / Out of scope".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@doctor/api-client";

const AuthContext = createContext(null);

// Map a backend role (Prisma UserRole enum) to its dashboard home route.
// Every target below is a real route in this app.
const ROLE_HOME = {
  DOCTOR: "/doctor/dashboard",
  RECEPTIONIST: "/receptionist/dashboard",
  CLINIC: "/clinic/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

export function roleHomePath(role) {
  return ROLE_HOME[role] || "/"; // unknown role → portal picker at app/page.jsx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await authService.refresh(); // silent restore via httpOnly refresh cookie
        const me = await authService.getMe();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null); // no session / backend unreachable — stay signed out
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials); // stores access token
    setUser(data.user || null);
    return data.user || null;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout(); // clears token even if the request fails
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    await authService.refresh();
    const me = await authService.getMe();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user && user.role ? user.role : null,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      refresh,
    }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
