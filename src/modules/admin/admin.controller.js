import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as adminService from "./admin.service.js";
import {
  listUsersQuerySchema,
  toggleUserStatusSchema,
  listClinicsQuerySchema,
} from "./admin.validation.js";

import { updateSettingsSchema } from "./admin.validation.js";
import { createAdminSchema } from "./admin.validation.js";

export const listClinics = asyncHandler(async (req, res) => {
  const query = listClinicsQuerySchema.parse(req.query);
  const result = await adminService.listClinics(query);
  res.status(200).json(new ApiResponse(true, "Clinics fetched", result));
});

export const approveClinic = asyncHandler(async (req, res) => {
  const clinic = await adminService.approveClinic(req.params.clinicId);
  res.status(200).json(new ApiResponse(true, "Clinic approved successfully", { clinic }));
});

export const revokeClinicApproval = asyncHandler(async (req, res) => {
  const clinic = await adminService.revokeClinicApproval(req.params.clinicId);
  res.status(200).json(new ApiResponse(true, "Clinic approval revoked", { clinic }));
});

export const listUnverifiedDoctors = asyncHandler(async (req, res) => {
  const doctors = await adminService.listUnverifiedDoctors();
  res.status(200).json(new ApiResponse(true, "Unverified doctors fetched", { doctors }));
});

export const verifyDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.verifyDoctor(req.params.doctorId);
  res.status(200).json(new ApiResponse(true, "Doctor verified successfully", { doctor }));
});

export const listUsers = asyncHandler(async (req, res) => {
  const query = listUsersQuerySchema.parse(req.query);
  const result = await adminService.listUsers(query);
  res.status(200).json(new ApiResponse(true, "Users fetched", result));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = toggleUserStatusSchema.parse(req.body);
  const user = await adminService.toggleUserStatus(req.params.userId, isActive);
  res
    .status(200)
    .json(new ApiResponse(true, `User ${isActive ? "activated" : "deactivated"} successfully`, { user }));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  res.status(200).json(new ApiResponse(true, "Platform stats fetched", { stats }));
});

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.getSettings();
  res.status(200).json(new ApiResponse(true, "Platform settings fetched", { settings }));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = updateSettingsSchema.parse(req.body);
  const settings = await adminService.updateSettings(data);
  res.status(200).json(new ApiResponse(true, "Platform settings updated", { settings }));
});

// super admin create admin
export const createAdmin = asyncHandler(async (req, res) => {
  const data = createAdminSchema.parse(req.body);
  const admin = await adminService.createAdmin(data);
  res.status(201).json(new ApiResponse(true, "Admin account created successfully", { admin }));
});

export const createClinic = asyncHandler(async (req, res) => {
  const data = createClinicSchema.parse(req.body);
  const result = await adminService.createClinic(data);
  res.status(201).json(new ApiResponse(true, "Clinic account created successfully", result));
});