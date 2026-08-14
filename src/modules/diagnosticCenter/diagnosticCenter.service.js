import ApiError from "../../utils/apiError.js";
import { hashPassword } from "../auth/auth.helper.js";
import { findUserByEmail, updateUserPassword } from "../auth/auth.repository.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";
import {
  findCenterByUserId,
  findCenterById,
  updateCenterProfile,
  updateCenterLogo,
  createStaffWithUser,
  findStaffByCenter,
  findStaffByUserId,
  findStaffById,
  searchCentersByName,
  searchAllApprovedCenters,
} from "./diagnosticCenter.repository.js";

export const getMyProfile = async (userId) => {
  const center = await findCenterByUserId(userId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");
  return center;
};

export const updateMyProfile = async (userId, data) => {
  const center = await findCenterByUserId(userId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");
  return updateCenterProfile(center.id, data);
};

export const addStaff = async (centerUserId, payload) => {
  const center = await findCenterByUserId(centerUserId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");
  if (!center.isApproved) throw new ApiError(403, "Your diagnostic center is not yet approved by admin");

  const existing = await findUserByEmail(payload.email);
  if (existing) throw new ApiError(409, "A user with this email already exists");

  const hashedPassword = await hashPassword(payload.password);

  const { user, staff } = await createStaffWithUser({
    userData: { ...payload, password: hashedPassword },
    diagnosticCenterId: center.id,
  });

  const { password, refreshToken, ...safeUser } = user;
  return { user: safeUser, staff };
};

export const listMyStaff = async (centerUserId) => {
  const center = await findCenterByUserId(centerUserId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");
  return findStaffByCenter(center.id);
};

export const changeStaffPassword = async (centerUserId, { userId, newPassword }) => {
  const center = await findCenterByUserId(centerUserId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");

  const staff = await findStaffByUserId(userId);
  if (!staff || staff.diagnosticCenterId !== center.id) {
    throw new ApiError(404, "Staff member not found at your diagnostic center");
  }

  const hashedPassword = await hashPassword(newPassword);
  await updateUserPassword(userId, hashedPassword);
};

export const uploadLogo = async (centerUserId, fileBuffer) => {
  const center = await findCenterByUserId(centerUserId);
  if (!center) throw new ApiError(404, "Diagnostic center profile not found");

  const result = await uploadBufferToCloudinary(fileBuffer, "jeet/diagnostic-centers");
  const updated = await updateCenterLogo(center.id, result.secure_url);

  if (center.logo) {
    await deleteFromCloudinary(center.logo);
  }

  return updated;
};

export const searchByName = async (name) => {
  return searchCentersByName(name);
};

export const listAllApprovedCenters = async () => {
  return searchAllApprovedCenters();
};