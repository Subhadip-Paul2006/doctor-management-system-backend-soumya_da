import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/apiError.js";
import * as userService from "./user.service.js";

export const uploadMyPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");
  const user = await userService.uploadMyPhoto(req.user.id, req.file.buffer);
  res.status(200).json(new ApiResponse(true, "Profile photo uploaded", { user }));
});