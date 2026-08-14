"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@doctor/types";
import { applyApiError } from "@doctor/api-client";
import { Alert, Button, Checkbox, Input } from "@doctor/ui";
import { useAuth, roleHomePath } from "./AuthProvider";

/**
 * Patient login (Phase 09 — wired to POST /api/v1/auth/login via authService).
 * Zod-validates input, calls useAuth().login (which stores the in-memory access
 * token), then redirects to the patient dashboard. Field-level + banner errors
 * are mapped from the backend envelope by applyApiError.
 */
export function LoginForm() {
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
      await login(parsed.data); // POST /auth/login → stores access token + sets user
      router.push(roleHomePath());
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
      setSubmitting(false); // stay on the form; on success we navigate away instead
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
      <Button type="button" variant="outline" className="w-full" disabled title="Google sign-in (OAuth redirect flow) is not enabled in this phase">
        Continue with Google
      </Button>
    </form>
  );
}
