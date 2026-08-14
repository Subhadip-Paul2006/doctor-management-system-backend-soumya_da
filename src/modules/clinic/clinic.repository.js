import prisma from "../../config/db.config.js";

export const findClinicByUserId = (userId) => {
  return prisma.clinic.findUnique({ where: { userId } });
};

export const findClinicById = (id) => {
  return prisma.clinic.findUnique({ where: { id } });
};

export const updateClinicProfile = (id, data) => {
  return prisma.clinic.update({ where: { id }, data });
};

export const createDoctorWithUser = ({ userData, doctorData, clinicId }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "DOCTOR", selfRegistered: false },
    });

    const doctor = await tx.doctor.create({
      data: { ...doctorData, userId: user.id, clinicId },
    });

    return { user, doctor };
  });
};

export const createReceptionistWithUser = ({ userData, clinicId }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { ...userData, role: "RECEPTIONIST", selfRegistered: false },
    });

    const receptionist = await tx.receptionist.create({
      data: { userId: user.id, clinicId },
    });

    return { user, receptionist };
  });
};

export const findDoctorsByClinic = (clinicId) => {
  return prisma.doctor.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
    },
  });
};

export const findReceptionistsByClinic = (clinicId) => {
  return prisma.receptionist.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
      assignedDoctors: {
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
    },
  });
};

export const findDoctorById = (id) => {
  return prisma.doctor.findUnique({ where: { id } });
};

export const findReceptionistById = (id) => {
  return prisma.receptionist.findUnique({ where: { id } });
};

export const assignDoctorsToReceptionist = (receptionistId, clinicId, doctorIds) => {
  return prisma.$transaction(async (tx) => {
    await tx.receptionistDoctor.deleteMany({
      where: { receptionistId, clinicId, doctorId: { notIn: doctorIds } },
    });

    for (const doctorId of doctorIds) {
      await tx.receptionistDoctor.upsert({
        where: { receptionistId_doctorId_clinicId: { receptionistId, doctorId, clinicId } },
        update: {},
        create: { receptionistId, doctorId, clinicId },
      });
    }

    return tx.receptionistDoctor.findMany({
      where: { receptionistId, clinicId },
      include: { doctor: { include: { user: { select: { name: true } } } } },
    });
  });
};

export const findAssignedDoctorsForReceptionistUser = (userId) => {
  return prisma.receptionist.findUnique({
    where: { userId },
    include: {
      assignedDoctors: {
        include: {
          doctor: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          clinic: { select: { id: true, clinicName: true } },
        },
      },
    },
  });
};

export const findDoctorOrReceptionistUser = async (userId, clinicId) => {
  const doctor = await prisma.doctor.findFirst({ where: { userId, clinicId } });
  if (doctor) return "DOCTOR";

  const receptionist = await prisma.receptionist.findFirst({ where: { userId, clinicId } });
  if (receptionist) return "RECEPTIONIST";

  return null;
};

export const updateDoctor = (id, data) => {
  return prisma.doctor.update({ where: { id }, data });
};

export const searchClinicsByName = (name) => {
  return prisma.clinic.findMany({
    where: {
      isApproved: true,
      clinicName: { contains: name, mode: "insensitive" },
    },
    select: {
      id: true,
      clinicName: true,
      city: true,
      address: true,
      logo: true,
    },
  });
};

export const updateClinicLogo = (clinicId, logo) => {
  return prisma.clinic.update({ where: { id: clinicId }, data: { logo } });
};

// holidays work

export const upsertWorkingHours = (clinicId, workingHours) => {
  return prisma.$transaction(
    workingHours.map((wh) =>
      prisma.clinicWorkingHours.upsert({
        where: { clinicId_dayOfWeek: { clinicId, dayOfWeek: wh.dayOfWeek } },
        update: { openTime: wh.openTime, closeTime: wh.closeTime, isClosed: wh.isClosed },
        create: { clinicId, ...wh },
      })
    )
  );
};

export const findWorkingHours = (clinicId) => {
  return prisma.clinicWorkingHours.findMany({
    where: { clinicId },
    orderBy: { dayOfWeek: "asc" },
  });
};

export const findWorkingHoursForDay = (clinicId, dayOfWeek) => {
  return prisma.clinicWorkingHours.findUnique({
    where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
  });
};

export const addHoliday = (clinicId, date, reason) => {
  return prisma.clinicHoliday.create({
    data: { clinicId, date: new Date(date), reason },
  });
};

export const removeHoliday = (clinicId, holidayId) => {
  return prisma.clinicHoliday.deleteMany({ where: { id: holidayId, clinicId } });
};

export const findHolidays = (clinicId) => {
  return prisma.clinicHoliday.findMany({
    where: { clinicId },
    orderBy: { date: "asc" },
  });
};

export const findHolidayForDate = (clinicId, date) => {
  return prisma.clinicHoliday.findUnique({
    where: { clinicId_date: { clinicId, date: new Date(date) } },
  });
};

export const setOnlineConsultationEnabled = (clinicId, enabled) => {
  return prisma.clinic.update({
    where: { id: clinicId },
    data: { onlineConsultationEnabled: enabled },
  });
};

export const getClinicById = (id) => {
  return prisma.clinic.findUnique({ where: { id } });
};

export const getWorkingHoursForClinicDay = (clinicId, dayOfWeek) => {
  return prisma.clinicWorkingHours.findUnique({
    where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
  });
};

export const getHolidayForClinicDate = (clinicId, date) => {
  return prisma.clinicHoliday.findUnique({
    where: { clinicId_date: { clinicId, date: new Date(date) } },
  });
};
export const findReceptionistByUserId = (userId) => {
  return prisma.receptionist.findUnique({ where: { userId }, include: { clinic: true } });
};

export const findReceivedRequestsForClinic = (clinicId) => {
  return prisma.doctorClinicAssociation.findMany({
    where: { clinicId, requestedBy: "DOCTOR" },
    include: {
      doctor: { include: { user: { select: { name: true, email: true, phone: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};
 