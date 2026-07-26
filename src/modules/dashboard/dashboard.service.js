import ApiError from "../../utils/apiError.js";
import { findDoctorByUserId } from "../doctor/doctor.repository.js";
import { findClinicByUserId } from "../clinic/clinic.repository.js";
import {
  getDoctorPrimaryClinicStats,
  getDoctorTodayAppointments,
  getDoctorApprovedAssociations,
  getDoctorPendingAssociations,
  getClinicTotalAndActiveDoctors,
  getClinicAssociationCounts,
  getClinicTodayAppointments,
  getClinicQueueSummary,
} from "./dashboard.repository.js";

const todayDateString = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};

export const getDoctorDashboard = async (doctorUserId) => {
  const doctor = await findDoctorByUserId(doctorUserId);
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const today = todayDateString();

  const [totalPatients, todayAppointments, approvedAssociations, pendingAssociations] =
    await Promise.all([
      getDoctorPrimaryClinicStats(doctor.id),
      getDoctorTodayAppointments(doctor.id, today),
      getDoctorApprovedAssociations(doctor.id),
      getDoctorPendingAssociations(doctor.id),
    ]);

  const totalClinics = 1 + approvedAssociations.length; // primary clinic + approved associations

  const clinicWisePatientCount = [
    {
      clinicId: doctor.clinicId,
      clinicName: null, // filled by frontend from doctor.clinic if needed, or we can include it
      patientCount: totalPatients,
      isPrimary: true,
    },
    ...approvedAssociations.map((a) => ({
      clinicId: a.clinicId,
      clinicName: a.clinic.clinicName,
      patientCount: 0, // booking against secondary clinics not yet wired — see note
      isPrimary: false,
    })),
  ];

  return {
    totalClinics,
    totalPatients,
    clinicWisePatientCount,
    todayAppointments,
    upcomingSchedule: approvedAssociations.map((a) => ({
      clinicId: a.clinicId,
      clinicName: a.clinic.clinicName,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
    pendingRequests: pendingAssociations,
    approvedClinics: approvedAssociations,
    note: "Patient counts and today's appointments currently reflect only the doctor's primary clinic. Booking against secondary (associated) clinics is not yet wired to the appointment system.",
  };
};

export const getClinicDashboard = async (clinicUserId) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const today = todayDateString();

  const [{ total, active }, requestCounts, todayAppointments, queueSummary] = await Promise.all([
    getClinicTotalAndActiveDoctors(clinic.id),
    getClinicAssociationCounts(clinic.id),
    getClinicTodayAppointments(clinic.id, today),
    getClinicQueueSummary(clinic.id, today),
  ]);

  return {
    totalDoctors: total,
    activeDoctors: active,
    pendingDoctorRequests: requestCounts.pending,
    approvedRequests: requestCounts.approved,
    rejectedRequests: requestCounts.rejected,
    todayAppointments,
    queueSummary,
  };
};