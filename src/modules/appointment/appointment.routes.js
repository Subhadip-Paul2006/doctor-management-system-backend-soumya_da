import { Router } from "express";
import * as appointmentController from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /appointments/doctors/search:
 *   get:
 *     summary: Search bookable doctors by name, clinic, city, or clinic+date (returns today's queue snapshot when date is given)
 *     tags: [Appointment]
 *     parameters:
 *       - in: query
 *         name: doctorName
 *         schema: { type: string }
 *       - in: query
 *         name: clinicName
 *         schema: { type: string }
 *       - in: query
 *         name: clinicId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-07-21" }
 *     responses:
 *       200: { description: Doctors fetched }
 */
router.get("/doctors/search", authMiddleware, appointmentController.searchDoctors);

/**
 * @swagger
 * /appointments/book/online:
 *   post:
 *     summary: (Patient) Book an online appointment — subject to the doctor's booking-window rule
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, clinicId, date]
 *             properties:
 *               doctorId: { type: string, format: uuid }
 *               clinicId: { type: string, format: uuid }
 *               date: { type: string, example: "2026-07-21" }
 *     responses:
 *       201: { description: Appointment booked successfully, returns the assigned sequential token }
 *       400: { description: Outside booking window, clinic closed/holiday, or doctor not bookable at this clinic }
 *       403: { description: Doctor not verified, or clinic does not accept online bookings }
 */
router.post(
  "/book/online",
  authMiddleware,
  roleMiddleware("PATIENT"),
  appointmentController.bookOnline
);

/**
 * @swagger
 * /appointments/book/reception:
 *   post:
 *     summary: (Receptionist/Clinic) Book for an existing or brand-new walk-in/phone patient — bypasses the online booking-window rule
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, clinicId, date]
 *             properties:
 *               doctorId: { type: string, format: uuid }
 *               clinicId: { type: string, format: uuid }
 *               date: { type: string, example: "2026-07-21" }
 *               bookingSource: { type: string, enum: [RECEPTION, WALK_IN, PHONE], default: RECEPTION }
 *               patientId: { type: string, format: uuid, description: "Use for an existing patient" }
 *               newPatient:
 *                 type: object
 *                 description: "Use to create a guest patient with no login account"
 *                 properties:
 *                   name: { type: string }
 *                   age: { type: integer }
 *                   phone: { type: string }
 *     responses:
 *       201: { description: Appointment booked successfully }
 *       400: { description: Clinic closed/holiday, or doctor not bookable at this clinic }
 *       404: { description: Patient not found }
 */
router.post(
  "/book/reception",
  authMiddleware,
  roleMiddleware("RECEPTIONIST", "CLINIC"),
  appointmentController.bookReception
);

/**
 * @swagger
 * /appointments/me:
 *   get:
 *     summary: (Patient) List my own appointments — queue detail is redacted if the doctor's queueMode is PRIVATE
 *     tags: [Appointment]
 *     responses:
 *       200: { description: Appointments fetched }
 */
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("PATIENT"),
  appointmentController.getMyAppointments
);

export default router;