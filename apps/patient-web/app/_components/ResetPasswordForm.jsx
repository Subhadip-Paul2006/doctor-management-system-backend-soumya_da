"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordSchema } from "@doctor/types";
import { Alert, Button, Input } from "@doctor/ui";

/**
 * Phase 08 reset-password — UI + Zod validation. Real submission isolated in
 * `resetPassword`, where @doctor/api-client POST /api/v1/auth/reset-password
 * wiring lands in Phase 09.
 */
export function ResetPasswordForm({ initialEmail = "" }) {
  const [form, setForm] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function resetPassword(payload) {
    // Isolated submission point — Phase 09: httpClient.post("/auth/reset-password", payload).
    await new Promise((r) => setTimeout(r, 400));
    throw Object.assign(new Error("Password-reset service is not connected yet."), { code: "UNAVAILABLE" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const parsed = resetPasswordSchema.safeParse(form);
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
      await resetPassword(parsed.data);
      setDone(true);
    } catch (err) {
      setServerError(err?.message || "Could not reset your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="success" title="Password updated">
          Your password has been reset. You can log in with your new password.
        </Alert>
        <Link href="/login"><Button size="sm" className="w-full">Go to log in</Button></Link>
      </div>
    );
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
        label="6-digit reset code"
        name="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={form.otp}
        onChange={set("otp")}
        error={errors.otp}
        placeholder="e.g. 483920"
        maxLength={6}
      />
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={form.newPassword}
        onChange={set("newPassword")}
        error={errors.newPassword}
        hint="At least 8 characters."
      />
      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
      />
      <Button type="submit" className="w-full" loading={submitting}>
        Reset password
      </Button>
    </form>
  );
}
