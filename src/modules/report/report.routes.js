import { Router } from "express";
import * as reportController from "./report.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/daily",
  authMiddleware,
  roleMiddleware("CLINIC"),
  reportController.getDailyReport
);

router.get(
  "/monthly",
  authMiddleware,
  roleMiddleware("CLINIC"),
  reportController.getMonthlyReport
);

router.get(
  "/patients/pdf",
  authMiddleware,
  roleMiddleware("CLINIC", "RECEPTIONIST"),
  reportController.getPatientListPDF
);

router.get(
  "/doctors/:doctorId/clinics/:clinicId/patients/pdf",
  authMiddleware,
  roleMiddleware("CLINIC", "RECEPTIONIST"),
  reportController.getDoctorPatientListPDF
);

export default router;