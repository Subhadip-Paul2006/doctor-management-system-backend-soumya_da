import { Router } from "express";
import * as centerController from "./diagnosticCenter.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

// Any authenticated user can browse/search diagnostic centers (needed to create a referral)
router.get("/search", authMiddleware, centerController.searchByName);
router.get("/all", authMiddleware, centerController.listAllApprovedCenters);

router.use(authMiddleware, roleMiddleware("DIAGNOSTIC_CENTER"));

router.get("/profile", centerController.getMyProfile);
router.patch("/profile", centerController.updateMyProfile);

router.post("/staff", centerController.addStaff);
router.get("/staff", centerController.listStaff);
router.patch("/staff/change-password", centerController.changeStaffPassword);

router.post("/logo", upload.single("photo"), centerController.uploadLogo);

export default router;