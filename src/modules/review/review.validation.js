import { z } from "zod";

export const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reportReviewSchema = z.object({
  reportReason: z.string().min(2, "Please provide a reason").max(500),
});

export const moderateReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});