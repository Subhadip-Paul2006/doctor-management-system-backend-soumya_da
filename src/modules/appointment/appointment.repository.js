import prisma from "../../config/db.config.js";

export const searchDoctors = async ({ q, doctorName, clinicName, clinicId, city, date }) => {
  const where = {
    isVerified: true,
    clinic: { isApproved: true },
  };

  if (doctorName) {
    where.user = { name: { contains: doctorName, mode: "insensitive" } };
  }
  if (clinicName) {
    where.clinic = { ...where.clinic, clinicName: { contains: clinicName, mode: "insensitive" } };
  }
  if (clinicId) {
    where.clinicId = clinicId;
  }
  if (city) {
    where.clinic = { ...where.clinic, city: { contains: city, mode: "insensitive" } };
  }

  // Single search-box mode: match doctor name, specialization, qualification,
  // clinic name, city, or address — whichever field the text matches.
  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { specialization: { contains: q, mode: "insensitive" } },
      { qualification: { contains: q, mode: "insensitive" } },
      { clinic: { clinicName: { contains: q, mode: "insensitive" } } },
      { clinic: { city: { contains: q, mode: "insensitive" } } },
      { clinic: { address: { contains: q, mode: "insensitive" } } },
    ];
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      user: { select: { name: true } },
      clinic: { select: { id: true, clinicName: true, city: true, address: true } },
    },
  });

  if (date) {
    const doctorsWithQueue = await Promise.all(
      doctors.map(async (doctor) => {
        const queue = await prisma.queue.findUnique({
          where: {
            doctorId_clinicId_date: { doctorId: doctor.id, clinicId: doctor.clinicId, date: new Date(date) },
          },
        });
        return { ...doctor, todayQueue: queue || null };
      })
    );
    return doctorsWithQueue;
  }

  return doctors;
};

// Returns every clinic a doctor can currently be booked at: their primary clinic
// plus any clinic where they have an APPROVED association.
export const getBookableClinicsForDoctor = async (doctorId) => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return [];

  const approvedAssociations = await prisma.doctorClinicAssociation.findMany({
    where: { doctorId, status: "APPROVED" },
  });

  return [doctor.clinicId, ...approvedAssociations.map((a) => a.clinicId)];
};

export const findOrCreateQueue = (doctorId, clinicId, date) => {
  return prisma.queue.upsert({
    where: { doctorId_clinicId_date: { doctorId, clinicId, date: new Date(date) } },
    update: {},
    create: { doctorId, clinicId, date: new Date(date) },
  });
};

export const getDoctorById = (id) => {
  return prisma.doctor.findUnique({ where: { id } });
};

export const getPatientById = (id) => {
  return prisma.patient.findUnique({ where: { id } });
};

export const createAppointmentWithToken = ({ doctorId, clinicId, patientId, queueId, date, bookingSource }) => {
  return prisma.$transaction(async (tx) => {
    const queue = await tx.queue.update({
      where: { id: queueId },
      data: { lastTokenIssued: { increment: 1 } },
    });

    const appointment = await tx.appointment.create({
      data: {
        doctorId,
        clinicId,
        patientId,
        queueId,
        date: new Date(date),
        token: queue.lastTokenIssued,
        bookingSource,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return { appointment, queue };
  });
};

export const createWalkInPatient = ({ name, age, phone }) => {
  return prisma.patient.create({
    data: { name, age, phone },
  });
};

export const findAppointmentsForPatient = (patientId) => {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      clinic: { select: { clinicName: true } },
      queue: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findAppointmentById = (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: { queue: true, doctor: true, patient: { include: { user: true } } },
  });
};

// stop queeue system if not need
export const getQueueModeForDoctorClinic = async (doctorId, clinicId) => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return "LIVE";

  if (doctor.clinicId === clinicId) {
    return doctor.queueMode;
  }

  const association = await prisma.doctorClinicAssociation.findFirst({
    where: { doctorId, clinicId, status: "APPROVED" },
  });

  return association?.queueMode || "LIVE";
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


export const getConsultationMinutesForDoctorClinic = async (doctorId, clinicId) => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return null;

  if (doctor.clinicId === clinicId) return doctor.avgConsultationMinutes;

  const association = await prisma.doctorClinicAssociation.findFirst({
    where: { doctorId, clinicId, status: "APPROVED" },
  });
  return association?.avgConsultationMinutes || null;
};

export const findAppointmentByIdFull = (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: { patient: true },
  });
};

export const cancelAppointmentRecord = (id, { cancelReason, cancelledBy }) => {
  return prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED", cancelReason, cancelledBy },
  });
};

export const getDoctorLeaveForDate = (doctorId, clinicId, date) => {
  return prisma.doctorLeave.findUnique({
    where: { doctorId_clinicId_date: { doctorId, clinicId, date: new Date(date) } },
  });
};