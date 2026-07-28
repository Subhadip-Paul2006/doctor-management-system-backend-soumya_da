import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as reportService from "./report.service.js";
import { dailyReportSchema, monthlyReportSchema } from "./report.validation.js";
import { generateReportPDF, generatePatientListPDF } from "../../utils/pdfGenerator.js";

export const getDailyReport = asyncHandler(async (req, res) => {
  const { date } = dailyReportSchema.parse(req.query);
  const report = await reportService.getDailyReport(req.user.id, date);

  if (req.query.format === "pdf") {
    return generateReportPDF(res, `daily-report-${date}.pdf`, report);
  }

  res.status(200).json(new ApiResponse(true, "Daily report fetched", { report }));
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = monthlyReportSchema.parse(req.query);
  const report = await reportService.getMonthlyReport(req.user.id, month);

  if (req.query.format === "pdf") {
    return generateReportPDF(res, `monthly-report-${month}.pdf`, report);
  }

  res.status(200).json(new ApiResponse(true, "Monthly report fetched", { report }));
});

export const getPatientListPDF = asyncHandler(async (req, res) => {
  const { clinicName, patients } = await reportService.getPatientListReport(req.user.id, req.user.role);
  generatePatientListPDF(res, "patient-list.pdf", clinicName, patients);
});