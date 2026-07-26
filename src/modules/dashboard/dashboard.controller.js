import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDoctorDashboard(req.user.id);
  res.status(200).json(new ApiResponse(true, "Doctor dashboard fetched", { dashboard }));
});

export const getClinicDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getClinicDashboard(req.user.id);
  res.status(200).json(new ApiResponse(true, "Clinic dashboard fetched", { dashboard }));
});