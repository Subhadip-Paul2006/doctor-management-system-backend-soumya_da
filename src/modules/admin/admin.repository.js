import prisma from "../../config/db.config.js";

export const findAllClinics = ({ isApproved, page = 1, limit = 20 }) => {
  const where = typeof isApproved === "boolean" ? { isApproved } : {};
  return prisma.clinic.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

export const countClinics = (isApproved) => {
  const where = typeof isApproved === "boolean" ? { isApproved } : {};
  return prisma.clinic.count({ where });
};

export const findClinicByIdRaw = (id) => {
  return prisma.clinic.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
};

export const setClinicApproval = (id, isApproved) => {
  return prisma.clinic.update({ where: { id }, data: { isApproved } });
};

export const findAllDoctorsUnverified = () => {
  return prisma.doctor.findMany({
    where: { isVerified: false },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      clinic: { select: { clinicName: true } },
    },
  });
};

export const findDoctorByIdRaw = (id) => {
  return prisma.doctor.findUnique({ where: { id } });
};

export const setDoctorVerification = (id, isVerified) => {
  return prisma.doctor.update({ where: { id }, data: { isVerified } });
};

export const getPlatformStats = async () => {
  const [totalUsers, totalClinics, approvedClinics, totalDoctors, verifiedDoctors, totalPatients] =
    await Promise.all([
      prisma.user.count(),
      prisma.clinic.count(),
      prisma.clinic.count({ where: { isApproved: true } }),
      prisma.doctor.count(),
      prisma.doctor.count({ where: { isVerified: true } }),
      prisma.patient.count(),
    ]);

  return {
    totalUsers,
    totalClinics,
    approvedClinics,
    pendingClinics: totalClinics - approvedClinics,
    totalDoctors,
    verifiedDoctors,
    unverifiedDoctors: totalDoctors - verifiedDoctors,
    totalPatients,
  };
};

export const getPlatformSettings = () => {
  return prisma.platformSetting.findFirst();
};

export const updatePlatformSettings = (id, data) => {
  return prisma.platformSetting.update({ where: { id }, data });
};

// super admin to admin
export const createAdminUser = (data) => {
  return prisma.user.create({
    data: { ...data, role: "ADMIN", selfRegistered: false, isVerified: true },
  });
};

export const createClinicUser = ({ userData, clinicName }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "CLINIC", selfRegistered: false, isVerified: true },
    });

    const clinic = await tx.clinic.create({
      data: { userId: user.id, clinicName, isApproved: true },
    });

    return { user, clinic };
  });
};

export const createDiagnosticCenterUser = ({ userData, centerName }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "DIAGNOSTIC_CENTER", selfRegistered: false, isVerified: true },
    });

    const diagnosticCenter = await tx.diagnosticCenter.create({
      data: { userId: user.id, centerName, isApproved: true },
    });

    return { user, diagnosticCenter };
  });
};

export const findAllDiagnosticCenters = ({ isApproved, page = 1, limit = 20 }) => {
  const where = typeof isApproved === "boolean" ? { isApproved } : {};
  return prisma.diagnosticCenter.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true, isActive: true } } },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
};

export const findDiagnosticCenterByIdRaw = (id) => {
  return prisma.diagnosticCenter.findUnique({ where: { id } });
};

export const setDiagnosticCenterApproval = (id, isApproved) => {
  return prisma.diagnosticCenter.update({ where: { id }, data: { isApproved } });
};