import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as queueService from "./queue.service.js";
import { recallTokenSchema, emergencyTokenSchema } from "./queue.validation.js";

export const getQueueStatus = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const queue = await queueService.getQueueStatus(doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Queue status fetched", { queue }));
});

export const next = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.nextToken(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Moved to next token", result));
});

export const previous = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.previousToken(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Moved to previous token", result));
});

export const skip = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.skipToken(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Token skipped", result));
});

export const recall = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const { token } = recallTokenSchema.parse(req.body);
  const result = await queueService.recallToken(req.user, doctorId, clinicId, date, token);
  res.status(200).json(new ApiResponse(true, "Token recalled", result));
});

export const pause = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.pauseQueue(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Queue paused", result));
});

export const resume = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.resumeQueue(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Queue resumed", result));
});

export const close = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.closeQueue(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Queue closed", result));
});

export const reopen = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const result = await queueService.reopenQueue(req.user, doctorId, clinicId, date);
  res.status(200).json(new ApiResponse(true, "Queue reopened", result));
});

export const emergency = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date } = req.params;
  const { patientId } = emergencyTokenSchema.parse(req.body);
  const appointment = await queueService.emergencyToken(req.user, doctorId, clinicId, date, patientId);
  res.status(201).json(new ApiResponse(true, "Emergency token issued", { appointment }));
});