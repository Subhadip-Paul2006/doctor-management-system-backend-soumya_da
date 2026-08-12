"use client";

import { useState } from "react";
import { loginSchema } from "@doctor/types";
import { Alert, Button, Checkbox, Input } from "@doctor/ui";

/**
 * Phase 08 unified staff login (Doctor / Receptionist / Clinic / Admin /
 * Super Admin) — UI + Zod validation. Real submission isolated in
 * `submitLogin`, where @doctor/api-client POST /api/v1/auth/login wiring lands
 * in Phase 09. Role-based redirect happens server/Phase 09 after auth/me.
 */
export function StaffLoginForm() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key) => (e) => {
    const value = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function submitLogin(payload) {
    // Isolated submission point — Phase 09: httpClient.post("/auth/login", payload).
    await new Promise((r) => setTimeout(r, 400));
    throw Object.assign(new Error("Authentication service is not connected yet."), { code: "UNAVAILABLE" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await submitLogin(parsed.data);
    } catch (err) {
      setServerError(err?.message || "Could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError ? <Alert variant="danger" role="alert">{serverError}</Alert> : null}
      <Input
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        placeholder="name@clinic.com"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        placeholder="Your password"
      />
      <Checkbox
        label="Keep me signed in"
        name="remember"
        checked={form.remember}
        onChange={set("remember")}
      />
      <Button type="submit" className="w-full" loading={submitting}>
        Sign in to staff portal
      </Button>
      <p className="text-center text-xs text-navy-500">
        Access is provisioned by your clinic or platform administrator.
      </p>
    </form>
  );
}
