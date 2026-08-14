"use client";

import { useState } from "react";
import Link from "next/link";
import { patientRegisterSchema } from "@doctor/types";
import { authService, applyApiError } from "@doctor/api-client";
import { Alert, Button, Input } from "@doctor/ui";

/**
 * Patient registration (Phase 09 — wired to POST /api/v1/auth/register via
 * authService). Registration returns the created user only (NO token), so on
 * success we surface a confirmation and route the patient to log in. The service
 * transforms dob "YYYY-MM-DD" → ISO datetime and omits empty phone/dob.
 */
export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", dob: "" });
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
    const parsed = patientRegisterSchema.safeParse(form);
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
      await authService.register(parsed.data); // POST /auth/register → { user } only
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
        <Alert variant="success" title="Account created">
          Your patient account is ready. Log in to book appointments and track your queue.
        </Alert>
        <Link href="/login"><Button size="sm" className="w-full">Go to log in</Button></Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError ? <Alert variant="danger" role="alert">{serverError}</Alert> : null}
      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        value={form.name}
        onChange={set("name")}
        error={errors.name}
        placeholder="e.g. Anil Kumar"
      />
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
        autoComplete="new-password"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        hint="At least 8 characters."
      />
      <Input
        label="Mobile number"
        name="phone"
        inputMode="numeric"
        autoComplete="tel"
        value={form.phone}
        onChange={set("phone")}
        error={errors.phone}
        placeholder="10-digit mobile"
      />
      <Input
        label="Date of birth"
        name="dob"
        type="date"
        autoComplete="bday"
        value={form.dob}
        onChange={set("dob")}
        error={errors.dob}
      />
      <p className="text-xs text-navy-500">
        Self-registration creates a patient account. Clinics and staff are onboarded by an administrator.
      </p>
      <Button type="submit" className="w-full" loading={submitting}>
        Create account
      </Button>
      <p className="text-center text-xs text-navy-500">
        Already registered? <Link href="/login" className="font-medium text-medical-700 hover:underline">Log in</Link>
      </p>
    </form>
  );
}
