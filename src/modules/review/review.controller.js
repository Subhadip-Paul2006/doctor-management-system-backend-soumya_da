import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as reviewService from "./review.service.js";
import {
  createReviewSchema,
  reportReviewSchema,
  moderateReviewSchema,
  listReviewsQuerySchema,
} from "./review.validation.js";

export const submitReview = asyncHandler(async (req, res) => {
  const data = createReviewSchema.parse(req.body);
  const review = await reviewService.submitReview(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Review submitted — pending approval", { review }));
});

export const reportReview = asyncHandler(async (req, res) => {
  const { reportReason } = reportReviewSchema.parse(req.body);
  const review = await reviewService.reportReview(req.params.reviewId, reportReason);
  res.status(200).json(new ApiResponse(true, "Review reported", { review }));
});

export const getDoctorReviews = asyncHandler(async (req, res) => {
  const query = listReviewsQuerySchema.parse(req.query);
  const result = await reviewService.getDoctorReviews({ doctorId: req.params.doctorId, ...query });
  res.status(200).json(new ApiResponse(true, "Doctor reviews fetched", result));
});

export const getClinicReviews = asyncHandler(async (req, res) => {
  const query = listReviewsQuerySchema.parse(req.query);
  const result = await reviewService.getClinicReviews({ clinicId: req.params.clinicId, ...query });
  res.status(200).json(new ApiResponse(true, "Clinic reviews fetched", result));
});

export const listPendingReviews = asyncHandler(async (req, res) => {
  const query = listReviewsQuerySchema.parse(req.query);
  const reviews = await reviewService.listPendingReviews(query);
  res.status(200).json(new ApiResponse(true, "Pending reviews fetched", { reviews }));
});

export const listReportedReviews = asyncHandler(async (req, res) => {
  const query = listReviewsQuerySchema.parse(req.query);
  const reviews = await reviewService.listReportedReviews(query);
  res.status(200).json(new ApiResponse(true, "Reported reviews fetched", { reviews }));
});

export const moderateReview = asyncHandler(async (req, res) => {
  const { action } = moderateReviewSchema.parse(req.body);
  const review = await reviewService.moderateReview(req.params.reviewId, action);
  res
    .status(200)
    .json(new ApiResponse(true, `Review ${action === "APPROVE" ? "approved" : "rejected"}`, { review }));
});