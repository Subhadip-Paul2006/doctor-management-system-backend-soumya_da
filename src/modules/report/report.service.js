import ApiError from "../../utils/apiError.js";
import { findClinicByUserId, findReceptionistByUserId } from "../clinic/clinic.repository.js";
import {
  getAppointmentsForClinicOnDate,
  getAppointmentsForClinicInMonth,
  getAppointmentsForClinicInRange,
  getDistinctPatientsForClinic,
  getDistinctPatientsForDoctorAtClinic,
} from "./report.repository.js";
import { summarizeAppointments, getWeekRange, getYearRange } from "./report.helper.js";

export const getDailyReport = async (clinicUserId, date) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const appointments = await getAppointmentsForClinicOnDate(clinic.id, date);
  const summary = summarizeAppointments(appointments);

  return { clinicName: clinic.clinicName, date, ...summary };
};

export const getMonthlyReport = async (clinicUserId, month) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

  const appointments = await getAppointmentsForClinicInMonth(clinic.id, startDate, endDate);
  const summary = summarizeAppointments(appointments);

  return { clinicName: clinic.clinicName, month, ...summary };
};

export const getWeeklyReport = async (clinicUserId, date) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const { start, end } = getWeekRange(date);
  const appointments = await getAppointmentsForClinicInRange(clinic.id, start, end);
  const summary = summarizeAppointments(appointments);

  return {
    clinicName: clinic.clinicName,
    weekStart: start.toISOString().split("T")[0],
    weekEnd: end.toISOString().split("T")[0],
    ...summary,
  };
};

export const getYearlyReport = async (clinicUserId, year) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const { start, end } = getYearRange(Number(year));
  const appointments = await getAppointmentsForClinicInRange(clinic.id, start, end);
  const summary = summarizeAppointments(appointments);

  return { clinicName: clinic.clinicName, year, ...summary };
};

export const getCustomRangeReport = async (clinicUserId, startDate, endDate) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const appointments = await getAppointmentsForClinicInRange(clinic.id, start, end);
  const summary = summarizeAppointments(appointments);

  return { clinicName: clinic.clinicName, startDate, endDate, ...summary };
};

// Resolves the clinicId (and clinic name) whether the caller is the Clinic itself or one of its Receptionists
const resolveClinicContext = async (userId, userRole) => {
  if (userRole === "CLINIC") {
    const clinic = await findClinicByUserId(userId);
    if (!clinic) throw new ApiError(404, "Clinic profile not found");
    return { clinicId: clinic.id, clinicName: clinic.clinicName };
  }

  if (userRole === "RECEPTIONIST") {
    const receptionist = await findReceptionistByUserId(userId);
    if (!receptionist) throw new ApiError(404, "Receptionist profile not found");
    return { clinicId: receptionist.clinicId, clinicName: receptionist.clinic.clinicName };
  }

  throw new ApiError(403, "Not authorized to access patient reports");
};

export const getPatientListReport = async (userId, userRole) => {
  const { clinicId, clinicName } = await resolveClinicContext(userId, userRole);
  const patients = await getDistinctPatientsForClinic(clinicId);
  return { clinicName, patients };
};

export const getDoctorPatientListReport = async (userId, userRole, doctorId, clinicId, date) => {
  const { clinicId: contextClinicId, clinicName } = await resolveClinicContext(userId, userRole);

  if (clinicId !== contextClinicId) {
    throw new ApiError(403, "You can only access patient lists for your own clinic");
  }

  const patients = await getDistinctPatientsForDoctorAtClinic(doctorId, clinicId, date);
  return { clinicName, patients };
};