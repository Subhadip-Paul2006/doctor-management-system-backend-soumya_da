"use client";

import { useState } from "react";
import { loginSchema } from "@doctor/types";
import { Alert, Button, Checkbox, Input } from "@doctor/ui";

/**
 * Phase 08 patient login — UI + Zod validation. Real submission is isolated in
 * `submitLogin`, which is where @doctor/api-client POST /api/v1/auth/login
 * wiring lands in Phase 09 (backend auth currently not running in this env).
 */
export function LoginForm() {
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
    // Intentionally does NOT call a backend that isn't running; surfaces a neutral
    // "service unavailable" style error so the error path is exercised and testable.
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
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={set("email")}
        error={errors.email}
        placeholder="you@example.com"
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
      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          name="remember"
          checked={form.remember}
          onChange={set("remember")}
        />
        <a href="/forgot-password" className="text-sm font-medium text-medical-700 hover:underline">
          Forgot password?
        </a>
      </div>
      <Button type="submit" className="w-full" loading={submitting}>
        Log in
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled title="Google sign-in activates in Phase 09">
        Continue with Google
      </Button>
    </form>
  );
}
