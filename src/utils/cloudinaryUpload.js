import cloudinary from "../config/cloudinary.config.js";
import logger from "../config/logger.config.js";

export const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Cloudinary secure_url looks like:
// https://res.cloudinary.com/<cloud>/image/upload/v169.../jeet/doctors/abc123.jpg
// The public_id it needs to delete that asset is: jeet/doctors/abc123 (no version, no extension).
export const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url) return null;
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;
  return afterUpload.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
};

// Best-effort cleanup — if this fails we log it but never block the caller,
// since the new photo has already been saved by the time this runs.
export const deleteFromCloudinary = async (url) => {
  const publicId = getPublicIdFromCloudinaryUrl(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error({ error, publicId }, "Failed to delete old Cloudinary asset");
  }
};