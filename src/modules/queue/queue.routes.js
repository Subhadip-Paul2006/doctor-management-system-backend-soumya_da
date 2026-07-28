import { Router } from "express";
import * as queueController from "./queue.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("RECEPTIONIST", "CLINIC", "SUPER_ADMIN", "ADMIN"));

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}:
 *   get:
 *     summary: Get the full queue status (current token, last issued, appointment list) for a doctor at a clinic on a date
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, example: "2026-07-21" }
 *     responses:
 *       200: { description: Queue status fetched }
 */
router.get("/:doctorId/:clinicId/:date", queueController.getQueueStatus);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/next:
 *   patch:
 *     summary: Advance the queue to the next token (marks previous COMPLETED, next CHECKED_IN)
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Moved to next token, broadcast live via Socket.io }
 *       400: { description: Queue paused/closed, or no more patients waiting }
 *       403: { description: Receptionist not assigned to this doctor }
 */
router.patch("/:doctorId/:clinicId/:date/next", queueController.next);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/previous:
 *   patch:
 *     summary: Move the queue back one token
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Moved to previous token }
 *       400: { description: Already at the beginning of the queue }
 */
router.patch("/:doctorId/:clinicId/:date/previous", queueController.previous);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/skip:
 *   patch:
 *     summary: Skip the next token, marking that patient ABSENT
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Token skipped }
 *       400: { description: No more patients waiting }
 */
router.patch("/:doctorId/:clinicId/:date/skip", queueController.skip);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/recall:
 *   patch:
 *     summary: Recall a specific earlier token back to CHECKED_IN
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: integer, example: 3 }
 *     responses:
 *       200: { description: Token recalled }
 *       404: { description: No appointment found with this token }
 */
router.patch("/:doctorId/:clinicId/:date/recall", queueController.recall);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/pause:
 *   patch:
 *     summary: Pause the queue (blocks Next)
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Queue paused }
 */
router.patch("/:doctorId/:clinicId/:date/pause", queueController.pause);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/resume:
 *   patch:
 *     summary: Resume a paused queue
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Queue resumed }
 */
router.patch("/:doctorId/:clinicId/:date/resume", queueController.resume);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/close:
 *   patch:
 *     summary: Close the queue for the day
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Queue closed }
 */
router.patch("/:doctorId/:clinicId/:date/close", queueController.close);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/reopen:
 *   patch:
 *     summary: Reopen a closed queue
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Queue reopened }
 */
router.patch("/:doctorId/:clinicId/:date/reopen", queueController.reopen);

/**
 * @swagger
 * /queue/{doctorId}/{clinicId}/{date}/emergency:
 *   post:
 *     summary: Insert an emergency token for a patient, jumping the normal queue order
 *     tags: [Queue]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId]
 *             properties:
 *               patientId: { type: string, format: uuid }
 *     responses:
 *       201: { description: Emergency token issued }
 */
router.post("/:doctorId/:clinicId/:date/emergency", queueController.emergency);

export default router;