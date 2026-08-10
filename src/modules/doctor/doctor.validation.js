import { z } from "zod";

export const searchDoctorsByNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const sendRequestToDoctorSchema = z.object({
  doctorId: z.string().uuid(),
  fee: z.number().nonnegative().optional(),
  dayOfWeek: z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be HH:mm"),
}).refine((data) => data.startTime < data.endTime, {
  message: "endTime must be after startTime",
});

// ADD THIS SCHEMA:
export const sendRequestToClinicSchema = z.object({
  clinicId: z.string().uuid(), // Assuming you are targeting a clinic by its UUID
  fee: z.number().nonnegative().optional(),
  dayOfWeek: z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
  ]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be HH:mm"),
}).refine((data) => data.startTime < data.endTime, {
  message: "endTime must be after startTime",
});

export const respondToRequestSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
});

export const updateConsultationTimeSchema = z.object({
  avgConsultationMinutes: z.number().int().positive().max(180),
});

export const markLeaveSchema = z.object({
  date: z.string(),
  reason: z.string().max(500).optional(),
});

export const delayNotificationSchema = z.object({
  delayMinutes: z.number().int().positive().max(300),
});