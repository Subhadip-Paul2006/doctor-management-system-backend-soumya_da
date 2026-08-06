import prisma from "../../config/db.config.js";

export const findAppointmentById = (id) => {
  return prisma.appointment.findUnique({ where: { id } });
};

export const findReviewByAppointmentId = (appointmentId) => {
  return prisma.review.findUnique({ where: { appointmentId } });
};

export const findReviewById = (id) => {
  return prisma.review.findUnique({ where: { id } });
};

export const createReview = (data) => {
  return prisma.review.create({ data });
};

export const updateReviewStatus = (id, status) => {
  return prisma.review.update({ where: { id }, data: { status } });
};

export const flagReviewAsReported = (id, reportReason) => {
  return prisma.review.update({ where: { id }, data: { isReported: true, reportReason } });
};

export const findApprovedReviewsForDoctor = ({ doctorId, page, limit }) => {
  return prisma.review.findMany({
    where: { doctorId, status: "APPROVED" },
    include: {
      patient: { select: { name: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findApprovedReviewsForClinic = ({ clinicId, page, limit }) => {
  return prisma.review.findMany({
    where: { clinicId, status: "APPROVED" },
    include: {
      patient: { select: { name: true, user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const getAverageRatingForDoctor = async (doctorId) => {
  const result = await prisma.review.aggregate({
    where: { doctorId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: result._avg.rating || 0, count: result._count.rating };
};

export const getAverageRatingForClinic = async (clinicId) => {
  const result = await prisma.review.aggregate({
    where: { clinicId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: result._avg.rating || 0, count: result._count.rating };
};

export const findPendingReviews = ({ page, limit }) => {
  return prisma.review.findMany({
    where: { status: "PENDING" },
    include: {
      patient: { select: { name: true, user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      clinic: { select: { clinicName: true } },
    },
    orderBy: { createdAt: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findReportedReviews = ({ page, limit }) => {
  return prisma.review.findMany({
    where: { isReported: true },
    include: {
      patient: { select: { name: true, user: { select: { name: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      clinic: { select: { clinicName: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const getPatientByUserId = (userId) => {
  return prisma.patient.findUnique({ where: { userId } });
};