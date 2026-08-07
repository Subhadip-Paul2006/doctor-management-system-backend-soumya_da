import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /notifications/me:
 *   get:
 *     summary: List my notifications (newest first)
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Notifications fetched }
 */
router.get("/me", notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get my unread notification count (for a badge icon)
 *     tags: [Notifications]
 *     responses:
 *       200: { description: Unread count fetched }
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Notification marked as read }
 *       403: { description: This notification does not belong to you }
 *       404: { description: Notification not found }
 */
router.patch("/:notificationId/read", notificationController.markRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all my notifications as read
 *     tags: [Notifications]
 *     responses:
 *       200: { description: All notifications marked as read }
 */
router.patch("/read-all", notificationController.markAllRead);

export default router;
