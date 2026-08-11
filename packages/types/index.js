// @doctor/types — shared data contracts & Zod schemas (Phase 01 foundation).
// Domain schemas are defined in later phases from docs/BACKEND_FRONTEND_CONTRACT.md.
import { z } from "zod";

// Smoke-test schema: verifies Zod is consumable from this package in Phase 01.
export const foundationCheckSchema = z.object({
  packageName: z.string(),
  phase: z.literal(1),
});

// ---------------------------------------------------------------------------
// Phase 05 — Patient Portal schemas.
// Field names mirror the Prisma Appointment / Review models and the
// `POST /api/v1/appointments` payload from docs/BACKEND_FRONTEND_CONTRACT.md
// §2.5 ({ doctorId, clinicId, date, bookingSource }). The patient-details
// sub-object is the shape shown in docs/USER_FLOWS.md Flow 1 step 3.
// These validate UI input only; the backend remains the source of truth.
// ---------------------------------------------------------------------------

export const APPOINTMENT_STATUSES = ["WAITING", "CHECKED_IN", "COMPLETED", "CANCELLED", "ABSENT"];

export const patientDetailsSchema = z.object({
  bookingFor: z.enum(["self", "family"]),
  name: z.string().trim().min(2, "Please enter the patient's full name"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  age: z
    .coerce.number({ invalid_type_error: "Age is required" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], { message: "Please select a gender" }),
});

export const appointmentBookingSchema = z
  .object({
    doctorId: z.string().min(1, "Doctor is required"),
    clinicId: z.string().min(1, "Clinic is required"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
      .refine((d) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(`${d}T00:00:00`) >= today;
      }, "Date cannot be in the past"),
    // LIVE-queue doctors issue a token; TIME_SLOT doctors need a concrete slot.
    timeSlot: z.string().optional(),
    bookingSource: z.literal("ONLINE"),
    patient: patientDetailsSchema,
  })
  .superRefine((val, ctx) => {
    if (val.timeSlot != null && val.timeSlot !== "" && !val.timeSlot.trim()) {
      ctx.addIssue({ code: "custom", path: ["timeSlot"], message: "Choose a time slot" });
    }
  });

export const reviewSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z
    .coerce.number({ invalid_type_error: "Select a star rating" })
    .int()
    .min(1, "Select a star rating")
    .max(5, "Rating must be 1–5"),
  comment: z.string().trim().max(500, "Keep the review under 500 characters").optional().or(z.literal("")),
});

export { z };
