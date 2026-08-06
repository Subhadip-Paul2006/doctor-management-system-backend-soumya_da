import ApiError from "../../utils/apiError.js";
import {
  findAppointmentById,
  findReviewByAppointmentId,
  findReviewById,
  createReview,
  updateReviewStatus,
  flagReviewAsReported,
  findApprovedReviewsForDoctor,
  findApprovedReviewsForClinic,
  getAverageRatingForDoctor,
  getAverageRatingForClinic,
  findPendingReviews,
  findReportedReviews,
  getPatientByUserId,
} from "./review.repository.js";

export const submitReview = async (patientUserId, { appointmentId, rating, comment }) => {
  const patient = await getPatientByUserId(patientUserId);
  if (!patient) throw new ApiError(404, "Patient profile not found");

  const appointment = await findAppointmentById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  if (appointment.patientId !== patient.id) {
    throw new ApiError(403, "This appointment does not belong to you");
  }

  if (appointment.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review a completed consultation");
  }

  const existing = await findReviewByAppointmentId(appointmentId);
  if (existing) throw new ApiError(409, "You have already reviewed this appointment");

  return createReview({
    appointmentId,
    patientId: patient.id,
    doctorId: appointment.doctorId,
    clinicId: appointment.clinicId,
    rating,
    comment,
  });
};

export const reportReview = async (reviewId, reportReason) => {
  const review = await findReviewById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  return flagReviewAsReported(reviewId, reportReason);
};

export const getDoctorReviews = async ({ doctorId, page, limit }) => {
  const [reviews, ratingSummary] = await Promise.all([
    findApprovedReviewsForDoctor({ doctorId, page, limit }),
    getAverageRatingForDoctor(doctorId),
  ]);

  return { reviews, averageRating: ratingSummary.average, totalReviews: ratingSummary.count };
};

export const getClinicReviews = async ({ clinicId, page, limit }) => {
  const [reviews, ratingSummary] = await Promise.all([
    findApprovedReviewsForClinic({ clinicId, page, limit }),
    getAverageRatingForClinic(clinicId),
  ]);

  return { reviews, averageRating: ratingSummary.average, totalReviews: ratingSummary.count };
};

export const listPendingReviews = async ({ page, limit }) => {
  return findPendingReviews({ page, limit });
};

export const listReportedReviews = async ({ page, limit }) => {
  return findReportedReviews({ page, limit });
};

export const moderateReview = async (reviewId, action) => {
  const review = await findReviewById(reviewId);
  if (!review) throw new ApiError(404, "Review not found");

  if (review.status !== "PENDING") {
    throw new ApiError(400, `This review has already been ${review.status.toLowerCase()}`);
  }

  const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
  return updateReviewStatus(reviewId, newStatus);
};