import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as analyticsService from "./analytics.service.js";
import { dailyDashboardSchema, growthQuerySchema } from "./analytics.validation.js";

export const getDailyDashboard = asyncHandler(async (req, res) => {
  const { date } = dailyDashboardSchema.parse(req.query);
  const dashboard = await analyticsService.getDailyDashboard(req.user.id, date);
  res.status(200).json(new ApiResponse(true, "Daily dashboard fetched", { dashboard }));
});

export const getGrowthAnalytics = asyncHandler(async (req, res) => {
  const query = growthQuerySchema.parse(req.query);
  const analytics = await analyticsService.getGrowthAnalytics(req.user.id, query);
  res.status(200).json(new ApiResponse(true, "Growth analytics fetched", { analytics }));
});