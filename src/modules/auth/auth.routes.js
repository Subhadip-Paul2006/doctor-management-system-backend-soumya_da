import { Router } from "express";
import passport from "passport";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", otpLimiter, authController.forgotPassword);
router.post("/reset-password", otpLimiter, authController.resetPassword);

router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

// Google OAuth
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