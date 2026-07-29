import ApiError from "../../utils/apiError.js";
import { getPlatformSettings, updatePlatformSettings } from "./admin.repository.js";

import {
  findAllClinics,
  countClinics,
  findClinicByIdRaw,
  setClinicApproval,
  findAllDoctorsUnverified,
  findDoctorByIdRaw,
  setDoctorVerification,
  getPlatformStats,
} from "./admin.repository.js";
import {
  findAllUsers,
  countUsers,
  findUserByIdRaw,
  setUserActiveStatus,
} from "../user/user.repository.js";

import { hashPassword } from "../auth/auth.helper.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import { createAdminUser } from "./admin.repository.js";

export const getSettings = async () => {
  const settings = await getPlatformSettings();
  if (!settings) throw new ApiError(500, "Platform settings not initialized");
  return settings;
};

export const updateSettings = async ({ bookingWindowMinutes }) => {
  const settings = await getPlatformSettings();
  if (!settings) throw new ApiError(500, "Platform settings not initialized");
  return updatePlatformSettings(settings.id, { bookingWindowMinutes });
};

export const listClinics = async ({ isApproved, page, limit }) => {
  const [clinics, total] = await Promise.all([
    findAllClinics({ isApproved, page, limit }),
    countClinics(isApproved),
  ]);
  return { clinics, total, page, limit };
};

export const approveClinic = async (clinicId) => {
  const clinic = await findClinicByIdRaw(clinicId);
  if (!clinic) throw new ApiError(404, "Clinic not found");
  if (clinic.isApproved) throw new ApiError(400, "Clinic is already approved");

  return setClinicApproval(clinicId, true);
};

export const revokeClinicApproval = async (clinicId) => {
  const clinic = await findClinicByIdRaw(clinicId);
  if (!clinic) throw new ApiError(404, "Clinic not found");

  return setClinicApproval(clinicId, false);
};

export const listUnverifiedDoctors = async () => {
  return findAllDoctorsUnverified();
};

export const verifyDoctor = async (doctorId) => {
  const doctor = await findDoctorByIdRaw(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (doctor.isVerified) throw new ApiError(400, "Doctor is already verified");

  return setDoctorVerification(doctorId, true);
};

export const listUsers = async ({ role, page, limit }) => {
  const [users, total] = await Promise.all([
    findAllUsers({ role, page, limit }),
    countUsers(role),
  ]);
  return { users, total, page, limit };
};

export const toggleUserStatus = async (userId, isActive) => {
  const user = await findUserByIdRaw(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "SUPER_ADMIN") {
    throw new ApiError(403, "Cannot modify a Super Admin account");
  }

  return setUserActiveStatus(userId, isActive);
};

export const getStats = async () => {
  return getPlatformStats();
};

// super admin to admin


export const createAdmin = async ({ name, email, password, phone }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const hashedPassword = await hashPassword(password);
  const user = await createAdminUser({ name, email, phone, password: hashedPassword });

  const { password: _pw, refreshToken, ...safeUser } = user;
  return safeUser;
};