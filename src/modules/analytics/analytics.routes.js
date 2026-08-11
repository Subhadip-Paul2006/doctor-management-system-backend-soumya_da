import { Router } from "express";
import * as analyticsController from "./analytics.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /analytics/daily-dashboard:
 *   get:
 *     summary: Today's (or a specific date's) clinic patient dashboard — total/new/returning patients, status breakdown, doctor-wise counts, live queue summary
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-08-11" }
 *     responses:
 *       200: { description: Daily dashboard fetched }
 */
router.get(
  "/daily-dashboard",
  authMiddleware,
  roleMiddleware("CLINIC"),
  analyticsController.getDailyDashboard
);

/**
 * @swagger
 * /analytics/growth:
 *   get:
 *     summary: Patient growth trend (new vs returning) bucketed by day/week/month/year over a date range, with growth-rate % vs the previous equal-length period
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: granularity
 *         schema: { type: string, enum: [daily, weekly, monthly, yearly] }
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, example: "2026-07-01" }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, example: "2026-07-31" }
 *     responses:
 *       200: { description: Growth analytics fetched }
 */
router.get(
  "/growth",
  authMiddleware,
  roleMiddleware("CLINIC"),
  analyticsController.getGrowthAnalytics
);

export default router;