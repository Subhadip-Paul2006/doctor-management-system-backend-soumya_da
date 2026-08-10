import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import * as clinicController from "../clinic/clinic.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

/**
 * @swagger
 * /doctors/search:
 *   get:
 *     summary: Search verified doctors by name
 *     tags: [Doctor]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema: { type: string }
 *         example: Biswajit
 *     responses:
 *       200: { description: Doctors fetched }
 */
router.get("/search", authMiddleware, doctorController.searchByName);

/**
 * @swagger
 * /doctors/clinics/search:
 *   get:
 *     summary: Search approved clinics by name (used by doctors to find a clinic to join)
 *     tags: [Doctor]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Clinics fetched }
 */
router.get("/clinics/search", authMiddleware, clinicController.searchByName);

/**
 * @swagger
 * /doctors/requests:
 *   post:
 *     summary: (Clinic) Send a connection request to a doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, dayOfWeek, startTime, endTime]
 *             properties:
 *               doctorId: { type: string, format: uuid }
 *               fee: { type: number }
 *               dayOfWeek: { type: string, enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY] }
 *               startTime: { type: string, example: "15:00" }
 *               endTime: { type: string, example: "18:00" }
 *     responses:
 *       201: { description: Request sent to doctor (may include a conflictWarning note) }
 *       404: { description: Doctor not found }
 */
router.post(
  "/requests",
  authMiddleware,
  roleMiddleware("CLINIC"),
  doctorController.sendRequestToDoctor
);

/**
 * @swagger
 * /doctors/requests/sent:
 *   get:
 *     summary: (Clinic) List all connection requests this clinic has sent to doctors
 *     tags: [Doctor]
 *     responses:
 *       200: { description: Sent requests fetched }
 */
router.get(
  "/requests/sent",
  authMiddleware,
  roleMiddleware("CLINIC"),
  doctorController.getMySentRequests
);

/**
 * @swagger
 * /doctors/requests/received:
 *   get:
 *     summary: (Doctor) List all connection requests received from clinics
 *     tags: [Doctor]
 *     responses:
 *       200: { description: Received requests fetched }
 */
router.get(
  "/requests/received",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorController.getMyReceivedRequests
);

/**
 * @swagger
 * /doctors/requests/{associationId}/respond:
 *   patch:
 *     summary: (Doctor) Accept or reject a clinic's connection request
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [ACCEPT, REJECT] }
 *     responses:
 *       200: { description: Request approved or rejected }
 *       409: { description: Approval blocked due to a schedule conflict }
 */
router.patch(
  "/requests/:associationId/respond",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorController.respondToClinicRequest
);

/**
 * @swagger
 * /doctors/clinic-requests:
 *   post:
 *     summary: (Doctor) Send a connection request to a clinic
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clinicId, dayOfWeek, startTime, endTime]
 *             properties:
 *               clinicId: { type: string, format: uuid }
 *               fee: { type: number }
 *               dayOfWeek: { type: string, enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY] }
 *               startTime: { type: string, example: "15:00" }
 *               endTime: { type: string, example: "18:00" }
 *     responses:
 *       201: { description: Request sent to clinic (may include a conflictWarning note) }
 *       403: { description: Doctor profile not yet verified by admin }
 */
router.post(
  "/clinic-requests",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorController.sendRequestToClinic
);

/**
 * @swagger
 * /doctors/associations/{associationId}/cancel:
 *   patch:
 *     summary: Cancel a pending or approved doctor-clinic association (either party)
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: associationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Association cancelled }
 *       403: { description: This association does not belong to you }
 */
router.patch(
  "/associations/:associationId/cancel",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC"),
  doctorController.cancelAssociation
);

/**
 * @swagger
 * /doctors/profile-photo:
 *   post:
 *     summary: (Doctor) Upload profile photo
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       200: { description: Profile photo uploaded }
 *       400: { description: No image file provided }
 */
router.post(
  "/profile-photo",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  upload.single("photo"),
  doctorController.uploadProfilePhoto
);

/**
 * @swagger
 * /doctors/{doctorId}/clinics/{clinicId}/consultation-time:
 *   patch:
 *     summary: Set a doctor's average consultation time at a specific clinic (used to estimate patient wait time)
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [avgConsultationMinutes]
 *             properties:
 *               avgConsultationMinutes: { type: integer, example: 10 }
 *     responses:
 *       200: { description: Consultation time updated }
 *       403: { description: Not permitted to manage this doctor at this clinic }
 *       404: { description: Doctor not found or not associated with this clinic }
 */
router.patch(
  "/:doctorId/clinics/:clinicId/consultation-time",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC", "RECEPTIONIST", "SUPER_ADMIN", "ADMIN"),
  doctorController.updateConsultationTime
);

/**
 * @swagger
 * /doctors/{doctorId}/clinics/{clinicId}/leave:
 *   post:
 *     summary: Mark a doctor on leave for a specific date at a specific clinic
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date]
 *             properties:
 *               date: { type: string, example: "2026-08-20" }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Doctor marked on leave }
 *       409: { description: Already on leave for this date }
 */
router.post(
  "/:doctorId/clinics/:clinicId/leave",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC", "RECEPTIONIST", "SUPER_ADMIN", "ADMIN"),
  doctorController.markLeave
);

/**
 * @swagger
 * /doctors/{doctorId}/clinics/{clinicId}/leave:
 *   delete:
 *     summary: Cancel a doctor's leave for a specific date
 *     tags: [Doctor]
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
 *         schema: { type: string }
 *     responses:
 *       200: { description: Leave cancelled }
 *       404: { description: No leave found for this date }
 */
router.delete(
  "/:doctorId/clinics/:clinicId/leave",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC", "RECEPTIONIST", "SUPER_ADMIN", "ADMIN"),
  doctorController.cancelLeave
);

/**
 * @swagger
 * /doctors/{doctorId}/clinics/{clinicId}/leave:
 *   get:
 *     summary: List a doctor's upcoming leave dates at a specific clinic
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Upcoming leaves fetched }
 */
router.get(
  "/:doctorId/clinics/:clinicId/leave",
  authMiddleware,
  doctorController.listLeaves
);

/**
 * @swagger
 * /doctors/{doctorId}/clinics/{clinicId}/delay:
 *   post:
 *     summary: Notify today's waiting patients that the doctor is running late
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [delayMinutes]
 *             properties:
 *               delayMinutes: { type: integer, example: 20 }
 *     responses:
 *       200: { description: Delay notification sent }
 */
router.post(
  "/:doctorId/clinics/:clinicId/delay",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC", "RECEPTIONIST", "SUPER_ADMIN", "ADMIN"),
  doctorController.notifyDelay
);

export default router;