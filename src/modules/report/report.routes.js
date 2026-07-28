import { Router } from "express";
import * as reportController from "./report.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /reports/daily:
 *   get:
 *     summary: (Clinic) Get a daily appointment report — JSON by default, or PDF with ?format=pdf
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-07-21" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf] }
 *     responses:
 *       200: { description: Daily report fetched (JSON), or a PDF file download }
 */
router.get(
  "/daily",
  authMiddleware,
  roleMiddleware("CLINIC"),
  reportController.getDailyReport
);

/**
 * @swagger
 * /reports/monthly:
 *   get:
 *     summary: (Clinic) Get a monthly appointment report — JSON by default, or PDF with ?format=pdf
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: string, example: "2026-07" }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, pdf] }
 *     responses:
 *       200: { description: Monthly report fetched (JSON), or a PDF file download }
 */
router.get(
  "/monthly",
  authMiddleware,
  roleMiddleware("CLINIC"),
  reportController.getMonthlyReport
);

/**
 * @swagger
 * /reports/patients/pdf:
 *   get:
 *     summary: (Clinic/Receptionist) Download a PDF of every distinct patient registered at this clinic (Name, Age, Phone)
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
 *     summary: (Clinic/Receptionist) Download a PDF of patients seen by a specific doctor at a specific clinic on a specific date (Name, Age, DOB, Phone)
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
 *       400: { description: date query param is required }
 *       403: { description: You can only access patient lists for your own clinic }
 */
router.get(
  "/doctors/:doctorId/clinics/:clinicId/patients/pdf",
  authMiddleware,
  roleMiddleware("CLINIC", "RECEPTIONIST"),
  reportController.getDoctorPatientListPDF
);

export default router;