import { z } from "zod";

const booleanQueryParam = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => (val === undefined ? undefined : val === "true"));

export const listUsersQuerySchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "CLINIC", "RECEPTIONIST", "DOCTOR", "PATIENT"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listClinicsQuerySchema = z.object({
  isApproved: booleanQueryParam,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateSettingsSchema = z.object({
  bookingWindowMinutes: z.number().int().positive("Must be a positive number of minutes"),
});

// superadmin create admin

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

 export const createClinicSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  clinicName: z.string().min(2, "Clinic name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});