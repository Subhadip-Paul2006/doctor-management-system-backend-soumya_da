import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import * as userController from "./user.controller.js";

const router = Router();

/**
 * @swagger
 * /users/me/photo:
 *   post:
 *     summary: (Receptionist/Admin/Super Admin) Upload own profile photo
 *     tags: [User]
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
 *       403: { description: Not allowed for this role }
 */
router.post(
  "/me/photo",
  authMiddleware,
  roleMiddleware("RECEPTIONIST", "ADMIN", "SUPER_ADMIN"),
  upload.single("photo"),
  userController.uploadMyPhoto
);

export default router;