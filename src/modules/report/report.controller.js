import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import * as reportService from "./report.service.js";
import {
  dailyReportSchema,
  monthlyReportSchema,
  weeklyReportSchema,
  yearlyReportSchema,
  customRangeReportSchema,
} from "./report.validation.js";
import { generateReportPDF, generatePatientListPDF, generateDoctorPatientListPDF } from "../../utils/pdfGenerator.js";
import { generateReportExcel } from "../../utils/excelGenerator.js";

const sendReport = (res, report, format, filenameBase) => {
  if (format === "pdf") {
    return generateReportPDF(res, `${filenameBase}.pdf`, report);
  }
  if (format === "excel") {
    return generateReportExcel(res, `${filenameBase}.xlsx`, report);
  }
  return res.status(200).json(new ApiResponse(true, "Report fetched", { report }));
};

export const getDailyReport = asyncHandler(async (req, res) => {
  const { date } = dailyReportSchema.parse(req.query);
  const report = await reportService.getDailyReport(req.user.id, date);
  return sendReport(res, report, req.query.format, `daily-report-${date}`);
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { month } = monthlyReportSchema.parse(req.query);
  const report = await reportService.getMonthlyReport(req.user.id, month);
  return sendReport(res, report, req.query.format, `monthly-report-${month}`);
});

export const getWeeklyReport = asyncHandler(async (req, res) => {
  const { date } = weeklyReportSchema.parse(req.query);
  const report = await reportService.getWeeklyReport(req.user.id, date);
  return sendReport(res, report, req.query.format, `weekly-report-${report.weekStart}-to-${report.weekEnd}`);
});

export const getYearlyReport = asyncHandler(async (req, res) => {
  const { year } = yearlyReportSchema.parse(req.query);
  const report = await reportService.getYearlyReport(req.user.id, year);
  return sendReport(res, report, req.query.format, `yearly-report-${year}`);
});

export const getCustomRangeReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = customRangeReportSchema.parse(req.query);
  const report = await reportService.getCustomRangeReport(req.user.id, startDate, endDate);
  return sendReport(res, report, req.query.format, `report-${startDate}-to-${endDate}`);
});

export const getPatientListPDF = asyncHandler(async (req, res) => {
  const { clinicName, patients } = await reportService.getPatientListReport(req.user.id, req.user.role);
  generatePatientListPDF(res, "patient-list.pdf", clinicName, patients);
});

export const getDoctorPatientListPDF = asyncHandler(async (req, res) => {
  const { doctorId, clinicId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json(new ApiResponse(false, "A date query param (YYYY-MM-DD) is required"));
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: { select: { name: true } } },
  });
  if (!doctor) {
    return res.status(404).json(new ApiResponse(false, "Doctor not found"));
  }

  const { clinicName, patients } = await reportService.getDoctorPatientListReport(
    req.user.id,
    req.user.role,
    doctorId,
    clinicId,
    date
  );

  generateDoctorPatientListPDF(
    res,
    `patients-${doctor.user.name}-${date}.pdf`,
    clinicName,
    doctor.user.name,
    date,
    patients
  );
});