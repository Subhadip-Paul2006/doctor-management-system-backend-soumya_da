import ApiError from "../../utils/apiError.js";
import { findClinicByUserId } from "../clinic/clinic.repository.js";
import { getAppointmentsForClinicOnDate, getAppointmentsForClinicInMonth } from "./report.repository.js";
import { summarizeAppointments } from "./report.helper.js";
import { findReceptionistByUserId } from "../clinic/clinic.repository.js";
import { getDistinctPatientsForClinic } from "./report.repository.js";

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
  const endDate = new Date(year, monthNum, 0); // last day of month

  const appointments = await getAppointmentsForClinicInMonth(clinic.id, startDate, endDate);
  const summary = summarizeAppointments(appointments);

  return { clinicName: clinic.clinicName, month, ...summary };
};

export const findReceptionistByUserId = (userId) => {
  return prisma.receptionist.findUnique({ where: { userId }, include: { clinic: true } });
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