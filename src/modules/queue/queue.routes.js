import { Router } from "express";
import * as queueController from "./queue.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("RECEPTIONIST", "CLINIC", "SUPER_ADMIN", "ADMIN"));

router.get("/:doctorId/:clinicId/:date", queueController.getQueueStatus);
router.patch("/:doctorId/:clinicId/:date/next", queueController.next);
router.patch("/:doctorId/:clinicId/:date/previous", queueController.previous);
router.patch("/:doctorId/:clinicId/:date/skip", queueController.skip);
router.patch("/:doctorId/:clinicId/:date/recall", queueController.recall);
router.patch("/:doctorId/:clinicId/:date/pause", queueController.pause);
router.patch("/:doctorId/:clinicId/:date/resume", queueController.resume);
router.patch("/:doctorId/:clinicId/:date/close", queueController.close);
router.patch("/:doctorId/:clinicId/:date/reopen", queueController.reopen);
router.post("/:doctorId/:clinicId/:date/emergency", queueController.emergency);

export default router;