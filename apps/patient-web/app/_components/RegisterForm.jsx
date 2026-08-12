"use client";

import { useState } from "react";
import Link from "next/link";
import { patientRegisterSchema } from "@doctor/types";
import { Alert, Button, Input } from "@doctor/ui";

/**
 * Phase 08 patient registration — UI + Zod validation. Real submission is
 * isolated in `submitRegister`, where @doctor/api-client POST
 * /api/v1/auth/register wiring lands in Phase 09 (backend not running here).
 */
export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", dob: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function submitRegister(payload) {
    // Isolated submission point — Phase 09: httpClient.post("/auth/register", payload).
    await new Promise((r) => setTimeout(r, 400));
    throw Object.assign(new Error("Registration service is not connected yet."), { code: "UNAVAILABLE" });
  }

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
      await submitRegister(parsed.data);
    } catch (err) {
      setServerError(err?.message || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
