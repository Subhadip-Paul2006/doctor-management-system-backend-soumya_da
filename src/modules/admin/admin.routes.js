import { Router } from "express";
import * as adminController from "./admin.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN", "ADMIN"));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform-wide stats (users, clinics, doctors, patients)
 *     tags: [Admin]
 *     responses:
 *       200: { description: Platform stats fetched }
 */
router.get("/stats", adminController.getStats);

/**
 * @swagger
 * /admin/clinics:
 *   get:
 *     summary: List clinics, optionally filtered by approval status
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: isApproved
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Clinics fetched }
 */
router.get("/clinics", adminController.listClinics);

/**
 * @swagger
 * /admin/clinics/{clinicId}/approve:
 *   patch:
 *     summary: Approve a pending clinic
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Clinic approved successfully }
 *       400: { description: Clinic is already approved }
 */
router.patch("/clinics/:clinicId/approve", adminController.approveClinic);

/**
 * @swagger
 * /admin/clinics/{clinicId}/revoke:
 *   patch:
 *     summary: Revoke a clinic's approval
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Clinic approval revoked }
 */
router.patch("/clinics/:clinicId/revoke", adminController.revokeClinicApproval);

/**
 * @swagger
 * /admin/doctors/unverified:
 *   get:
 *     summary: List all unverified doctors
 *     tags: [Admin]
 *     responses:
 *       200: { description: Unverified doctors fetched }
 */
router.get("/doctors/unverified", adminController.listUnverifiedDoctors);

/**
 * @swagger
 * /admin/doctors/{doctorId}/verify:
 *   patch:
 *     summary: Verify a doctor
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Doctor verified successfully }
 *       400: { description: Doctor is already verified }
 */
router.patch("/doctors/:doctorId/verify", adminController.verifyDoctor);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List users, optionally filtered by role
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [SUPER_ADMIN, ADMIN, CLINIC, RECEPTIONIST, DOCTOR, PATIENT] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Users fetched }
 */
router.get("/users", adminController.listUsers);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Activate or deactivate a user account
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: User activated or deactivated successfully }
 *       403: { description: Cannot modify a Super Admin account }
 */
router.patch("/users/:userId/status", adminController.toggleUserStatus);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get platform settings (e.g. booking window minutes)
 *     tags: [Admin]
 *     responses:
 *       200: { description: Platform settings fetched }
 */
router.get("/settings", adminController.getSettings);

/**
 * @swagger
 * /admin/settings:
 *   patch:
 *     summary: Update platform settings
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingWindowMinutes]
 *             properties:
 *               bookingWindowMinutes: { type: integer, example: 180 }
 *     responses:
 *       200: { description: Platform settings updated }
 */
router.patch("/settings", adminController.updateSettings);

export default router;