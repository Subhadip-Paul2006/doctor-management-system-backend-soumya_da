import prisma from "../../config/db.config.js";

export const searchDoctorsByName = (name) => {
  return prisma.doctor.findMany({
    where: {
      isVerified: true,
      user: { name: { contains: name, mode: "insensitive" } },
    },
    include: {
      user: { select: { name: true, email: true } },
      clinic: { select: { clinicName: true, city: true } },
    },
  });
};

export const findDoctorByIdWithUser = (id) => {
  return prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });
};

// Any APPROVED association for this doctor, across all clinics — used for conflict checking
export const findApprovedAssociationsForDoctor = (doctorId) => {
  return prisma.doctorClinicAssociation.findMany({
    where: { doctorId, status: "APPROVED" },
  });
};

export const createAssociationRequest = (data) => {
  return prisma.doctorClinicAssociation.create({
    data,
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      clinic: { select: { clinicName: true } },
    },
  });
};

export const findAssociationById = (id) => {
  return prisma.doctorClinicAssociation.findUnique({ where: { id } });
};

export const updateAssociationStatus = (id, status) => {
  return prisma.doctorClinicAssociation.update({ where: { id }, data: { status } });
};

export const findRequestsForDoctor = (doctorId) => {
  return prisma.doctorClinicAssociation.findMany({
    where: { doctorId },
    include: { clinic: { select: { clinicName: true, city: true, logo: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const findRequestsForClinic = (clinicId) => {
  return prisma.doctorClinicAssociation.findMany({
    where: { clinicId },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};
export const findDoctorByUserId = (userId) => {
  return prisma.doctor.findUnique({
    where: { userId },
    include: { user: true },
  });
};

export const createClinicRequestFromDoctor = (data) => {
  return prisma.doctorClinicAssociation.create({
    data,
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      clinic: { select: { clinicName: true } },
    },
  });
};

export const updateDoctorProfilePhoto = (doctorId, profilePhoto) => {
  return prisma.doctor.update({ where: { id: doctorId }, data: { profilePhoto } });
};

export const updateDoctorAvgConsultation = (doctorId, minutes) => {
  return prisma.doctor.update({ where: { id: doctorId }, data: { avgConsultationMinutes: minutes } });
};

export const findApprovedAssociationByDoctorAndClinic = (doctorId, clinicId) => {
  return prisma.doctorClinicAssociation.findFirst({ where: { doctorId, clinicId, status: "APPROVED" } });
};

export const updateAssociationAvgConsultation = (associationId, minutes) => {
  return prisma.doctorClinicAssociation.update({
    where: { id: associationId },
    data: { avgConsultationMinutes: minutes },
  });
};