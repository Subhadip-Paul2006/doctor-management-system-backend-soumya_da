"use client";

// Patient-web auth state (Phase 09 — the minimal client auth context the API
// layer needs to hold the in-memory access token and drive post-login routing).
//
// The access token lives in @doctor/api-client's in-memory token-store (set by
// authService.login/refresh); the refresh token is an httpOnly cookie owned by
// the backend. On mount we attempt a silent session restore (refresh → getMe);
// failures (no session / backend unreachable) simply leave the user signed out.
//
// NOTE: full route-guard middleware (blocking unauthenticated /dashboard access,
// role authorization) is Phase 8 scope and is intentionally NOT implemented here
// — see the Phase 09 report "Deviations / Out of scope".

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@doctor/api-client";

const AuthContext = createContext(null);

// Every authenticated patient lands on the dashboard.
export function roleHomePath() {
  return "/dashboard";
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
