import { z } from "zod";

export const dailyReportSchema = z.object({
  date: z.string(), // YYYY-MM-DD
});

export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
});