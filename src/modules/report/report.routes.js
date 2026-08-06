import { Router } from "express";
import * as reportController from "./report.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /reports/daily:
 *   get:
 *     summary: Daily clinic report — JSON, PDF, or Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-07-21" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report fetched or file download }
 */
router.get("/daily", authMiddleware, roleMiddleware("CLINIC"), reportController.getDailyReport);

/**
 * @swagger
 * /reports/weekly:
 *   get:
 *     summary: Weekly clinic report (Monday-Sunday containing the given date) — JSON, PDF, or Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-07-21" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report fetched or file download }
 */
router.get("/weekly", authMiddleware, roleMiddleware("CLINIC"), reportController.getWeeklyReport);

/**
 * @swagger
 * /reports/monthly:
 *   get:
 *     summary: Monthly clinic report — JSON, PDF, or Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: string, example: "2026-07" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report fetched or file download }
 */
router.get("/monthly", authMiddleware, roleMiddleware("CLINIC"), reportController.getMonthlyReport);

/**
 * @swagger
 * /reports/yearly:
 *   get:
 *     summary: Yearly clinic report — JSON, PDF, or Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: string, example: "2026" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report fetched or file download }
 */
router.get("/yearly", authMiddleware, roleMiddleware("CLINIC"), reportController.getYearlyReport);

/**
 * @swagger
 * /reports/custom:
 *   get:
 *     summary: Custom date-range clinic report — JSON, PDF, or Excel
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, example: "2026-07-01" }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, example: "2026-07-31" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf, excel] }
 *     responses:
 *       200: { description: Report fetched or file download }
 */
router.get("/custom", authMiddleware, roleMiddleware("CLINIC"), reportController.getCustomRangeReport);

/**
 * @swagger
 * /reports/patients/pdf:
 *   get:
 *     summary: (Clinic/Receptionist) Download a PDF of every distinct patient registered at this clinic
 *     tags: [Reports]
 *     responses:
 *       200: { description: PDF file download }
 */
router.get(
  "/patients/pdf",
  authMiddleware,
  roleMiddleware("CLINIC", "RECEPTIONIST"),
  reportController.getPatientListPDF
);

/**
 * @swagger
 * /reports/doctors/{doctorId}/clinics/{clinicId}/patients/pdf:
 *   get:
 *     summary: (Clinic/Receptionist) Download a PDF of patients seen by a specific doctor at a specific clinic on a specific date
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-06-25" }
 *     responses:
 *       200: { description: PDF file download }
 */
router.get(
  "/doctors/:doctorId/clinics/:clinicId/patients/pdf",
  authMiddleware,
  roleMiddleware("CLINIC", "RECEPTIONIST"),
  reportController.getDoctorPatientListPDF
);

export default router;