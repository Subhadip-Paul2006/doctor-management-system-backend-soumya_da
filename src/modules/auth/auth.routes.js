import { Router } from "express";
import passport from "passport";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new Patient or Clinic account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Anil Kumar
 *               email:
 *                 type: string
 *                 example: anil@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               phone:
 *                 type: string
 *                 example: "9777777777"
 *               dob:
 *                 type: string
 *                 format: date-time
 *               role:
 *                 type: string
 *                 enum: [PATIENT, CLINIC]
 *                 default: PATIENT
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User with this email already exists
 */
router.post("/register", authLimiter, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: anil@test.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken and sets refreshToken cookie
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account deactivated
 */
router.post("/login", authLimiter, authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Get a new access token using the refresh token cookie
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: New accessToken issued
 *       401:
 *         description: Refresh token missing, invalid, or revoked
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password-reset OTP via email (self-registered patients only)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent if the email exists (response is intentionally non-revealing)
 */
router.post("/forgot-password", otpLimiter, authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using the OTP sent by forgot-password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *                 example: "483920"
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/reset-password", otpLimiter, authController.resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and clear the refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", authMiddleware, authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user fetched
 *       401:
 *         description: Missing or invalid access token
 */
router.get("/me", authMiddleware, authController.getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/v1/auth/google/failure" }),
  authController.googleCallback
);

router.get("/google/failure", (req, res) => {
  res.status(401).json({ success: false, message: "Google authentication failed" });
});

export default router;