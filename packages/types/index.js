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

// ---------------------------------------------------------------------------
// Phase 06 — Doctor schedule manager (apps/staff-dashboard).
// Mirrors Doctor.queueMode / Doctor.avgConsultationMinutes and the
// DoctorClinicAssociation weekly rows from docs/BACKEND_FRONTEND_CONTRACT.md
// §3.2/§3.4. UI-side validation only; backend remains source of truth
// (PUT /api/v1/doctors/schedule).
// ---------------------------------------------------------------------------

export const QUEUE_MODES = ["LIVE", "TIME_SLOT", "PRIVATE"];

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleDaySchema = z
  .object({
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    if (row.status !== "ACTIVE") return;
    if (!row.startTime || !timePattern.test(row.startTime)) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Start time (HH:mm) required" });
    }
    if (!row.endTime || !timePattern.test(row.endTime)) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time (HH:mm) required" });
    }
    if (row.startTime && row.endTime && timePattern.test(row.startTime) && timePattern.test(row.endTime) && row.endTime <= row.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "End must be after start" });
    }
  });

export const doctorScheduleSchema = z.object({
  queueMode: z.enum(QUEUE_MODES, { message: "Select a queue mode" }),
  avgConsultationMinutes: z
    .coerce.number({ invalid_type_error: "Consultation minutes required" })
    .int("Must be a whole number")
    .min(1, "At least 1 minute")
    .max(120, "Keep under 120 minutes"),
  weekly: z.array(scheduleDaySchema).length(7, "All 7 days are required"),
});

// ---------------------------------------------------------------------------
// Phase 08/09 — Authentication forms (apps/patient-web + apps/staff-dashboard).
// Mirror the backend auth validators (src/modules/auth/auth.validation.js):
//   login    { email, password:min1 }
//   register { name:min2, email, password:min6, phone?, dob?:datetime }
//   forgot   { email }
//   reset    { email, otp:len6, newPassword:min6 }
// These validate UI input only; @doctor/api-client maps them to the backend
// contract (dob "YYYY-MM-DD" -> ISO datetime; empty phone/dob omitted;
// confirmPassword is client-only and stripped before the request is sent).
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const patientRegisterSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  // The visible hint says "At least 8 characters"; the backend enforces a
  // 6-char minimum, so this is a stricter (safe) subset for new-account creation.
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date")
    .optional()
    .or(z.literal("")),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// ---------------------------------------------------------------------------
// Phase 07/09 — Receptionist walk-in registration (apps/staff-dashboard).
// Validates the walk-in form's UI shape. @doctor/api-client maps this onto the
// backend guest-patient + reception-booking contract
// (src/modules/patient/patient.validation.js createGuestPatientSchema —
// gender is upper-cased to MALE|FEMALE|OTHER — and
// src/modules/appointment/appointment.validation.js bookReceptionAppointmentSchema,
// where clinicId + date come from the receptionist front-desk context).
// NOTE: isEmergency + address have no field on the reception-booking endpoint
// (emergency is a separate POST /queue/.../emergency) — TO BE CONFIRMED WITH
// BACKEND TEAM; they are collected in the UI but not sent by the service.
// ---------------------------------------------------------------------------

export const walkInRegistrationSchema = z.object({
  doctorId: z.string().min(1, "Select a doctor"),
  name: z.string().trim().min(2, "Please enter the patient's full name"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  age: z
    .coerce.number({ invalid_type_error: "Age is required" })
    .int("Age must be a whole number")
    .min(1, "Enter a valid age")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], { message: "Please select a gender" }),
  address: z.string().trim().optional().or(z.literal("")),
  bookingSource: z.enum(["WALK_IN", "PHONE", "RECEPTION"], { message: "Select a booking source" }),
  isEmergency: z.boolean().optional().default(false),
});

export { z };
