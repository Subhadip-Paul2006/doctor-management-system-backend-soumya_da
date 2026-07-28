import prisma from "../../config/db.config.js";

export const getAppointmentsForClinicOnDate = (clinicId, date) => {
  return prisma.appointment.findMany({
    where: { clinicId, date: new Date(date) },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
};

export const getAppointmentsForClinicInMonth = (clinicId, startDate, endDate) => {
  return prisma.appointment.findMany({
    where: {
      clinicId,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
};

export const getDistinctPatientsForClinic = async (clinicId) => {
  const appointments = await prisma.appointment.findMany({
    where: { clinicId },
    distinct: ["patientId"],
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  return appointments.map((appt) => ({
    name: appt.patient.user?.name || appt.patient.name,
    age: appt.patient.age,
    phone: appt.patient.user?.phone || appt.patient.phone,
  }));
};

export const getDistinctPatientsForDoctorAtClinic = async (doctorId, clinicId, date) => {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId, clinicId, date: new Date(date) },
    distinct: ["patientId"],
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  return appointments.map((appt) => ({
    name: appt.patient.user?.name || appt.patient.name,
    age: appt.patient.age,
    dob: appt.patient.dob,
    phone: appt.patient.user?.phone || appt.patient.phone,
  }));
};