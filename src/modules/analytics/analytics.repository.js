import prisma from "../../config/db.config.js";

export const getAppointmentsForClinicOnDate = (clinicId, date) => {
  return prisma.appointment.findMany({
    where: { clinicId, date: new Date(date) },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
};

export const getAppointmentsForClinicInRange = (clinicId, startDate, endDate) => {
  return prisma.appointment.findMany({
    where: { clinicId, date: { gte: startDate, lte: endDate } },
    select: {
      id: true,
      patientId: true,
      doctorId: true,
      date: true,
      status: true,
      doctor: { select: { user: { select: { name: true } } } },
    },
  });
};

// One row per patient who has EVER had an appointment at this clinic, with their
// earliest appointment date there — the basis for new-vs-returning classification.
export const getEarliestVisitDatePerPatient = async (clinicId) => {
  const rows = await prisma.appointment.groupBy({
    by: ["patientId"],
    where: { clinicId },
    _min: { date: true },
  });

  const map = new Map();
  rows.forEach((row) => map.set(row.patientId, row._min.date.toISOString().split("T")[0]));
  return map;
};

export const getQueuesForClinicOnDate = (clinicId, date) => {
  return prisma.queue.findMany({
    where: { clinicId, date: new Date(date) },
    include: { doctor: { include: { user: { select: { name: true } } } } },
  });
};