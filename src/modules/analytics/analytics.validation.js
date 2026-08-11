import { z } from "zod";

export const dailyDashboardSchema = z.object({
  date: z.string().optional(), // defaults to today if omitted
});

export const growthQuerySchema = z.object({
  granularity: z.enum(["daily", "weekly", "monthly", "yearly"]).default("daily"),
  startDate: z.string(),
  endDate: z.string(),
});