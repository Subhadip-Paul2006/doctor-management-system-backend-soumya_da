import { Router } from "express";
import * as reviewController from "./review.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: (Patient) Submit a review for a completed appointment
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, rating]
 *             properties:
 *               appointmentId: { type: string, format: uuid }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review submitted — pending approval }
 *       400: { description: Appointment is not completed yet }
 *       403: { description: Appointment does not belong to you }
 *       409: { description: Appointment already reviewed }
 */
router.post("/", authMiddleware, roleMiddleware("PATIENT"), reviewController.submitReview);

/**
 * @swagger
 * /reviews/{reviewId}/report:
 *   patch:
 *     summary: Report a review as inappropriate
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reportReason]
 *             properties:
 *               reportReason: { type: string }
 *     responses:
 *       200: { description: Review reported }
 *       404: { description: Review not found }
 */
router.patch("/:reviewId/report", authMiddleware, reviewController.reportReview);

/**
 * @swagger
 * /reviews/doctor/{doctorId}:
 *   get:
 *     summary: List a doctor's approved reviews with average rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Doctor reviews fetched }
 */
router.get("/doctor/:doctorId", authMiddleware, reviewController.getDoctorReviews);

/**
 * @swagger
 * /reviews/clinic/{clinicId}:
 *   get:
 *     summary: List a clinic's approved reviews with average rating
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Clinic reviews fetched }
 */
router.get("/clinic/:clinicId", authMiddleware, reviewController.getClinicReviews);

/**
 * @swagger
 * /reviews/pending:
 *   get:
 *     summary: (Admin) List reviews awaiting moderation
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Pending reviews fetched }
 */
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  reviewController.listPendingReviews
);

/**
 * @swagger
 * /reviews/reported:
 *   get:
 *     summary: (Admin) List reviews flagged as inappropriate
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Reported reviews fetched }
 */
router.get(
  "/reported",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  reviewController.listReportedReviews
);

/**
 * @swagger
 * /reviews/{reviewId}/moderate:
 *   patch:
 *     summary: (Admin) Approve or reject a pending review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               action: { type: string, enum: [APPROVE, REJECT] }
 *     responses:
 *       200: { description: Review approved or rejected }
 *       400: { description: Review already moderated }
 */
router.patch(
  "/:reviewId/moderate",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  reviewController.moderateReview
);

export default router;