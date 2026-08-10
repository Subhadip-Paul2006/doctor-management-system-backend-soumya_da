import { z } from "zod";

export const searchDoctorsSchema = z.object({
  doctorName: z.string().optional(),
  clinicName: z.string().optional(),
  clinicId: z.string().uuid().optional(),
  city: z.string().optional(),
  date: z.string().optional(),
});

export const bookOnlineAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  date: z.string(),
});

export const bookReceptionAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  date: z.string(),
  bookingSource: z.enum(["RECEPTION", "WALK_IN", "PHONE"]).default("RECEPTION"),
  patientId: z.string().uuid().optional(),
  newPatient: z
    .object({
      name: z.string().min(2, "Name is required"),
      age: z.number().int().positive("Age is required"),
      phone: z.string().optional(),
    })
    .optional(),
}).refine((data) => data.patientId || data.newPatient, {
  message: "Either patientId or newPatient details must be provided",
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  date: z.string(),
});