import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as reportService from "./report.service.js";
import { dailyReportSchema, monthlyReportSchema } from "./report.validation.js";
import { generateReportPDF, generatePatientListPDF } from "../../utils/pdfGenerator.js";
import { generateDoctorPatientListPDF } from "../../utils/pdfGenerator.js";
import prisma from "../../config/db.config.js";

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