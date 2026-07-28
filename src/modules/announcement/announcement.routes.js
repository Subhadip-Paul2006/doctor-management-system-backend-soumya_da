import { Router } from "express";
import * as announcementController from "./announcement.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /announcements/admin:
 *   post:
 *     summary: (Admin) Publish a platform-wide announcement
 *     tags: [Announcement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, message]
 *             properties:
 *               type: { type: string, enum: [DOCTOR_ABSENT, CLINIC_CLOSED, HOLIDAY, EMERGENCY, MAINTENANCE, GENERAL] }
 *               title: { type: string }
 *               message: { type: string }
 *     responses:
 *       201: { description: Announcement published, broadcast live via Socket.io }
 */
router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.publishPlatformAnnouncement
);

/**
 * @swagger
 * /announcements/admin:
 *   get:
 *     summary: (Admin) List all platform announcements
 *     tags: [Announcement]
 *     responses:
 *       200: { description: Announcements fetched }
 */
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.listAllPlatform
);

/**
 * @swagger
 * /announcements/clinic:
 *   post:
 *     summary: (Clinic) Publish a clinic-specific announcement, optionally tied to a doctor
 *     tags: [Announcement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, message]
 *             properties:
 *               type: { type: string, enum: [DOCTOR_ABSENT, CLINIC_CLOSED, HOLIDAY, EMERGENCY, MAINTENANCE, GENERAL] }
 *               title: { type: string }
 *               message: { type: string }
 *               doctorId: { type: string, format: uuid, description: "Optional — ties this notice to a specific doctor" }
 *     responses:
 *       201: { description: Announcement published }
 *       400: { description: Doctor does not belong to your clinic }
 */
router.post(
  "/clinic",
  authMiddleware,
  roleMiddleware("CLINIC"),
  announcementController.publishClinicAnnouncement
);

/**
 * @swagger
 * /announcements/clinic/{clinicId}:
 *   get:
 *     summary: View a clinic's active announcements (includes platform-wide ones too)
 *     tags: [Announcement]
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Announcements fetched }
 */
router.get("/clinic/:clinicId", authMiddleware, announcementController.listForClinic);

/**
 * @swagger
 * /announcements/{announcementId}/deactivate:
 *   patch:
 *     summary: Deactivate an announcement (Clinic can only deactivate their own; Admin can deactivate any)
 *     tags: [Announcement]
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Announcement deactivated }
 *       403: { description: You can only deactivate your own clinic's announcements }
 */
router.patch(
  "/:announcementId/deactivate",
  authMiddleware,
  roleMiddleware("CLINIC", "SUPER_ADMIN", "ADMIN"),
  announcementController.deactivate
);

export default router;