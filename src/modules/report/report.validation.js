import { z } from "zod";

export const dailyReportSchema = z.object({
  date: z.string(),
});

export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
});

export const weeklyReportSchema = z.object({
  date: z.string(), // any date within the target week — week computed Monday to Sunday
});

export const yearlyReportSchema = z.object({
  year: z.string().regex(/^\d{4}$/, "year must be YYYY"),
});

export const customRangeReportSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "startDate must be before or equal to endDate",
  });