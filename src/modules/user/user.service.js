import ApiError from "../../utils/apiError.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";
import { findUserAvatarById, updateUserAvatar } from "./user.repository.js";

// Self-service profile photo for roles that don't have their own dedicated
// photo field (Receptionist, Admin, Super Admin). Doctor and Clinic already
// manage their photo through their own modules (profilePhoto / logo).
export const uploadMyPhoto = async (userId, fileBuffer) => {
  const user = await findUserAvatarById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const oldAvatar = user.avatar;

  const result = await uploadBufferToCloudinary(fileBuffer, "jeet/users");
  const updated = await updateUserAvatar(userId, result.secure_url);

  if (oldAvatar) await deleteFromCloudinary(oldAvatar);

  return updated;
};