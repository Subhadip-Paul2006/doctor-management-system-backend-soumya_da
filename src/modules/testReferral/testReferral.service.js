import ApiError from "../../utils/apiError.js";
import { notifyUser } from "../notification/notification.service.js";
import {
  createReferral,
  findReferralById,
  findReferralsForPatient,
  findReferralsForDiagnosticCenter,
  findReferralsForClinic,
  findAllReferrals,
  getPatientByUserId,
  getPatientById,
  getDiagnosticCenterById,
  getDoctorByUserId,
  getClinicByUserId,
  getReceptionistByUserId,
  getDiagnosticStaffByUserId,
} from "./testReferral.repository.js";

// Resolves who is creating this referral and what referringClinicId (if any) applies.
// Doctor -> their primary clinic. Receptionist -> their clinic. Clinic -> itself.
const resolveCreatorContext = async (user) => {
  if (user.role === "DOCTOR") {
    const doctor = await getDoctorByUserId(user.id);
    if (!doctor) throw new ApiError(404, "Doctor profile not found");
    return { referringClinicId: doctor.clinicId, createdByRole: "DOCTOR" };
  }

  if (user.role === "RECEPTIONIST") {
    const receptionist = await getReceptionistByUserId(user.id);
    if (!receptionist) throw new ApiError(404, "Receptionist profile not found");
    return { referringClinicId: receptionist.clinicId, createdByRole: "RECEPTIONIST" };
  }

  if (user.role === "CLINIC") {
    const clinic = await getClinicByUserId(user.id);
    if (!clinic) throw new ApiError(404, "Clinic profile not found");
    return { referringClinicId: clinic.id, createdByRole: "CLINIC" };
  }

  throw new ApiError(403, "Only a Doctor, Receptionist, or Clinic can create a test referral");
};

export const createTestReferral = async (user, { patientId, appointmentId, diagnosticCenterId, testNames, notes }) => {
  const { referringClinicId, createdByRole } = await resolveCreatorContext(user);

  const patient = await getPatientById(patientId);
  if (!patient) throw new ApiError(404, "Patient not found");

  const center = await getDiagnosticCenterById(diagnosticCenterId);
  if (!center) throw new ApiError(404, "Diagnostic center not found");
  if (!center.isApproved) throw new ApiError(400, "This diagnostic center is not yet approved");

  const referral = await createReferral({
    patientId,
    appointmentId,
    diagnosticCenterId,
    testNames,
    notes,
    referringClinicId,
    createdByUserId: user.id,
    createdByRole,
  });

  if (patient.userId) {
    await notifyUser({
      userId: patient.userId,
      type: "GENERAL",
      title: "Test Referral Created",
      message: `You've been referred for: ${testNames.join(", ")} at ${center.centerName}.`,
      meta: { referralId: referral.id, diagnosticCenterId, testNames },
    });
  }

  return referral;
};

export const getMyReferralsAsPatient = async (userId, { page, limit }) => {
  const patient = await getPatientByUserId(userId);
  if (!patient) throw new ApiError(404, "Patient profile not found");
  return findReferralsForPatient({ patientId: patient.id, page, limit });
};

// For Diagnostic Center (owner) or its staff
export const getIncomingReferrals = async (user, { page, limit }) => {
  let diagnosticCenterId;

  if (user.role === "DIAGNOSTIC_CENTER") {
    const { findCenterByUserId } = await import("../diagnosticCenter/diagnosticCenter.repository.js");
    const center = await findCenterByUserId(user.id);
    if (!center) throw new ApiError(404, "Diagnostic center profile not found");
    diagnosticCenterId = center.id;
  } else if (user.role === "DIAGNOSTIC_STAFF") {
    const staff = await getDiagnosticStaffByUserId(user.id);
    if (!staff) throw new ApiError(404, "Staff profile not found");
    diagnosticCenterId = staff.diagnosticCenterId;
  } else {
    throw new ApiError(403, "Only a Diagnostic Center or its staff can view incoming referrals");
  }

  return findReferralsForDiagnosticCenter({ diagnosticCenterId, page, limit });
};

// For the referring Clinic — see referrals its Doctors/Receptionists have sent out
export const getSentReferrals = async (clinicUserId, { page, limit }) => {
  const clinic = await getClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return findReferralsForClinic({ clinicId: clinic.id, page, limit });
};

export const getAllReferralsForAdmin = async ({ page, limit }) => {
  return findAllReferrals({ page, limit });
};