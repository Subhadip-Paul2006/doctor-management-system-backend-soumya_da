"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordSchema } from "@doctor/types";
import { authService, applyApiError } from "@doctor/api-client";
import { Alert, Button, Input } from "@doctor/ui";

/**
 * Forgot-password (Phase 09 — wired to POST /api/v1/auth/forgot-password via
 * authService). Success is intentionally non-revealing per the backend
 * ("a reset code has been sent if the email exists").
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors({ email: parsed.error.issues[0]?.message });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await authService.forgotPassword(parsed.data); // POST /auth/forgot-password
      setSent(true);
    } catch (err) {
      applyApiError(err, setErrors, setServerError);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="success" title="Check your email">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a 6-digit reset code.
        </Alert>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button size="sm" className="w-full">Enter reset code</Button>
        </Link>
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
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
        error={errors.email}
        placeholder="you@example.com"
      />
      <Button type="submit" className="w-full" loading={submitting}>
        Send reset code
      </Button>
      <p className="text-center text-xs text-navy-500">
        Remembered it? <Link href="/login" className="font-medium text-medical-700 hover:underline">Back to log in</Link>
      </p>
    </form>
  );
}
