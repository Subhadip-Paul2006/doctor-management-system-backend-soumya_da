import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import * as doctorService from "./doctor.service.js";
import * as clinicController from "../clinic/clinic.controller.js";
import {
  searchDoctorsByNameSchema,
  sendRequestToDoctorSchema,
  sendRequestToClinicSchema,
  respondToRequestSchema,
} from "./doctor.validation.js";
import { updateConsultationTimeSchema, markLeaveSchema, delayNotificationSchema  } from "./doctor.validation.js";

export const searchByName = asyncHandler(async (req, res) => {
  const { name } = searchDoctorsByNameSchema.parse(req.query);
  const doctors = await doctorService.searchByName(name);
  res.status(200).json(new ApiResponse(true, "Doctors fetched", { doctors }));
});

export const sendRequestToDoctor = asyncHandler(async (req, res) => {
  const data = sendRequestToDoctorSchema.parse(req.body);
  const result = await doctorService.sendRequestToDoctor(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Request sent to doctor", result));
});

export const sendRequestToClinic = asyncHandler(async (req, res) => {
  const data = sendRequestToClinicSchema.parse(req.body);
  const result = await doctorService.sendRequestToClinic(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Request sent to clinic", result));
});

export const respondToClinicRequest = asyncHandler(async (req, res) => {
  const { action } = respondToRequestSchema.parse(req.body);
  const association = await doctorService.respondToClinicRequest(
    req.user.id,
    req.params.associationId,
    action
  );
  res
    .status(200)
    .json(new ApiResponse(true, `Request ${action === "ACCEPT" ? "approved" : "rejected"}`, { association }));
});

export const getMyReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await doctorService.getMyReceivedRequests(req.user.id);
  res.status(200).json(new ApiResponse(true, "Received requests fetched", { requests }));
});

export const getMySentRequests = asyncHandler(async (req, res) => {
  const requests = await doctorService.getMySentRequests(req.user.id);
  res.status(200).json(new ApiResponse(true, "Sent requests fetched", { requests }));
});

export const cancelAssociation = asyncHandler(async (req, res) => {
  const association = await doctorService.cancelAssociation(
    req.user.id,
    req.user.role,
    req.params.associationId
  );
  res.status(200).json(new ApiResponse(true, "Association cancelled", { association }));
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");
  const doctor = await doctorService.uploadProfilePhoto(req.user.id, req.file.buffer);
  res.status(200).json(new ApiResponse(true, "Profile photo uploaded", { doctor }));
});

export const updateConsultationTime = asyncHandler(async (req, res) => {
  const { avgConsultationMinutes } = updateConsultationTimeSchema.parse(req.body);
  const result = await doctorService.updateConsultationTime(
    req.user,
    req.params.doctorId,
    req.params.clinicId,
    avgConsultationMinutes
  );
  res.status(200).json(new ApiResponse(true, "Consultation time updated", { result }));
});

export const markLeave = asyncHandler(async (req, res) => {
  const { date, reason } = markLeaveSchema.parse(req.body);
  const leave = await doctorService.markDoctorOnLeave(
    req.user,
    req.params.doctorId,
    req.params.clinicId,
    date,
    reason
  );
  res.status(201).json(new ApiResponse(true, "Doctor marked on leave", { leave }));
});

export const cancelLeave = asyncHandler(async (req, res) => {
  await doctorService.cancelDoctorLeave(req.user, req.params.doctorId, req.params.clinicId, req.query.date);
  res.status(200).json(new ApiResponse(true, "Leave cancelled"));
});

export const listLeaves = asyncHandler(async (req, res) => {
  const leaves = await doctorService.listUpcomingDoctorLeaves(req.params.doctorId, req.params.clinicId);
  res.status(200).json(new ApiResponse(true, "Upcoming leaves fetched", { leaves }));
});

export const notifyDelay = asyncHandler(async (req, res) => {
  const { delayMinutes } = delayNotificationSchema.parse(req.body);
  const result = await doctorService.notifyDoctorDelay(
    req.user,
    req.params.doctorId,
    req.params.clinicId,
    delayMinutes
  );
  res.status(200).json(new ApiResponse(true, "Delay notification sent", result));
});