import prisma from "../../config/db.config.js";

export const createReferral = (data) => {
  return prisma.testReferral.create({
    data,
    include: {
      patient: { select: { name: true, user: { select: { name: true, phone: true } } } },
      referringClinic: { select: { clinicName: true } },
      diagnosticCenter: { select: { centerName: true } },
    },
  });
};

export const findReferralById = (id) => {
  return prisma.testReferral.findUnique({
    where: { id },
    include: {
      patient: { select: { userId: true, name: true, user: { select: { name: true, phone: true } } } },
    },
  });
};

export const findReferralsForPatient = ({ patientId, page, limit }) => {
  return prisma.testReferral.findMany({
    where: { patientId },
    include: {
      referringClinic: { select: { clinicName: true } },
      diagnosticCenter: { select: { centerName: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findReferralsForDiagnosticCenter = ({ diagnosticCenterId, page, limit }) => {
  return prisma.testReferral.findMany({
    where: { diagnosticCenterId },
    include: {
      patient: { select: { name: true, user: { select: { name: true, phone: true } } } },
      referringClinic: { select: { clinicName: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findReferralsForClinic = ({ clinicId, page, limit }) => {
  return prisma.testReferral.findMany({
    where: { referringClinicId: clinicId },
    include: {
      patient: { select: { name: true, user: { select: { name: true, phone: true } } } },
      diagnosticCenter: { select: { centerName: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const findAllReferrals = ({ page, limit }) => {
  return prisma.testReferral.findMany({
    include: {
      patient: { select: { name: true, user: { select: { name: true, phone: true } } } },
      referringClinic: { select: { clinicName: true } },
      diagnosticCenter: { select: { centerName: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const getPatientByUserId = (userId) => {
  return prisma.patient.findUnique({ where: { userId } });
};

export const getPatientById = (id) => {
  return prisma.patient.findUnique({ where: { id } });
};

export const getDiagnosticCenterById = (id) => {
  return prisma.diagnosticCenter.findUnique({ where: { id } });
};

export const getDoctorByUserId = (userId) => {
  return prisma.doctor.findUnique({ where: { userId } });
};

export const getClinicByUserId = (userId) => {
  return prisma.clinic.findUnique({ where: { userId } });
};

export const getReceptionistByUserId = (userId) => {
  return prisma.receptionist.findUnique({ where: { userId } });
};

export const getDiagnosticStaffByUserId = (userId) => {
  return prisma.diagnosticCenterStaff.findUnique({ where: { userId } });
};