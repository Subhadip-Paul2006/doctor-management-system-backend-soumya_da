import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  dashboardController.getDoctorDashboard
);

router.get(
  "/clinic",
  authMiddleware,
  roleMiddleware("CLINIC"),
  dashboardController.getClinicDashboard
);

export default router;