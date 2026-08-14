"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@doctor/types";
import { applyApiError } from "@doctor/api-client";
import { Alert, Button, Checkbox, Input } from "@doctor/ui";
import { useAuth, roleHomePath } from "./AuthProvider";

/**
 * Unified staff login (Phase 09 — wired to POST /api/v1/auth/login via
 * authService). After login, redirects by role (Doctor / Receptionist / Clinic /
 * Admin / Super Admin) using roleHomePath(user.role). Errors mapped by applyApiError.
 */
export function StaffLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key) => (e) => {
    const value = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

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
      const user = await login(parsed.data); // POST /auth/login → stores token + returns user
      router.push(roleHomePath(user && user.role)); // role-based dashboard
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
      setSubmitting(false); // stay on the form; on success we navigate away instead
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
