"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordSchema } from "@doctor/types";
import { authService, applyApiError } from "@doctor/api-client";
import { Alert, Button, Input } from "@doctor/ui";

/**
 * Reset-password (Phase 09 — wired to POST /api/v1/auth/reset-password via
 * authService). The form collects confirmPassword for client-side confirmation,
 * but the service strips it and sends only { email, otp, newPassword }.
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
      // Service sends only { email, otp, newPassword } — confirmPassword is client-only.
      await authService.resetPassword(parsed.data);
      setDone(true);
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
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
