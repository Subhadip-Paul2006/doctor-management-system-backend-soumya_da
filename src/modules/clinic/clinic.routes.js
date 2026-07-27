import { Router } from "express";
import * as clinicController from "./clinic.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("CLINIC"));

router.get("/profile", clinicController.getMyProfile);
router.patch("/profile", clinicController.updateMyProfile);

router.post("/doctors", clinicController.addDoctor);
router.get("/doctors", clinicController.listDoctors);
router.patch("/doctors/:doctorId", clinicController.editDoctor);

router.post("/receptionists", clinicController.addReceptionist);
router.get("/receptionists", clinicController.listReceptionists);

router.post("/receptionists/assign-doctors", clinicController.assignDoctorsToReceptionist);
router.patch("/staff/change-password", clinicController.changeStaffPassword);

router.patch("/requests/:associationId/respond", clinicController.respondToDoctorRequest);

router.post("/logo", upload.single("photo"), clinicController.uploadLogo);

router.post("/working-hours", clinicController.setWorkingHours);
router.get("/working-hours", clinicController.getWorkingHours);

router.post("/holidays", clinicController.addHoliday);
router.delete("/holidays/:holidayId", clinicController.removeHoliday);
router.get("/holidays", clinicController.listHolidays);

router.patch("/online-consultation", clinicController.toggleOnlineConsultation);

export default router;