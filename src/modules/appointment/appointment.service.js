import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import {
  searchDoctors,
  getBookableClinicsForDoctor,
  findOrCreateQueue,
  getDoctorById,
  getPatientById,
  createAppointmentWithToken,
  createWalkInPatient,
  findAppointmentsForPatient,
} from "./appointment.repository.js";
import { emitQueueUpdate } from "../../sockets/queue.socket.js";

const getPatientByUserId = (userId) => {
  return prisma.patient.findUnique({ where: { userId } });
};

export const searchForDoctors = async (filters) => {
  return searchDoctors(filters);
};

export const bookOnlineAppointment = async (patientUserId, { doctorId, clinicId, date }) => {
  const patient = await getPatientByUserId(patientUserId);
  if (!patient) throw new ApiError(404, "Patient profile not found");

  await assertBookableClinic(doctorId, clinicId);
  await validateBookingWindow(doctorId, clinicId);

  return bookAppointmentCore({
    doctorId,
    clinicId,
    patientId: patient.id,
    date,
    bookingSource: "ONLINE",
  });
};

export const bookReceptionAppointment = async ({
  doctorId,
  clinicId,
  date,
  patientId,
  newPatient,
  bookingSource,
}) => {
  await assertBookableClinic(doctorId, clinicId);

  let finalPatientId = patientId;

  if (!finalPatientId && newPatient) {
    const patient = await createWalkInPatient(newPatient);
    finalPatientId = patient.id;
  } else if (finalPatientId) {
    const existing = await getPatientById(finalPatientId);
    if (!existing) throw new ApiError(404, "Patient not found");
  }

  return bookAppointmentCore({
    doctorId,
    clinicId,
    patientId: finalPatientId,
    date,
    bookingSource: bookingSource || "RECEPTION",
  });
};

export const getMyAppointments = async (patientUserId) => {
  const patient = await getPatientByUserId(patientUserId);
  if (!patient) throw new ApiError(404, "Patient profile not found");
  return findAppointmentsForPatient(patient.id);
};

// Ensures the requested clinicId is actually one this doctor can be booked at
// (their primary clinic, or an APPROVED secondary association)
const assertBookableClinic = async (doctorId, clinicId) => {
  const bookableClinicIds = await getBookableClinicsForDoctor(doctorId);
  if (!bookableClinicIds.includes(clinicId)) {
    throw new ApiError(400, "This doctor is not currently bookable at the specified clinic");
  }
};

const bookAppointmentCore = async ({ doctorId, clinicId, patientId, date, bookingSource }) => {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (!doctor.isVerified) throw new ApiError(403, "Doctor is not yet verified");

  const queue = await findOrCreateQueue(doctorId, clinicId, date);
  if (queue.status === "CLOSED") {
    throw new ApiError(400, "Queue is closed for this date");
  }

  const { appointment, queue: updatedQueue } = await createAppointmentWithToken({
    doctorId,
    clinicId,
    patientId,
    queueId: queue.id,
    date,
    bookingSource,
  });

    emitQueueUpdate(doctorId, clinicId, {
    doctorId,
    clinicId,
    date,
    currentToken: updatedQueue.currentToken,
    lastTokenIssued: updatedQueue.lastTokenIssued,
    status: updatedQueue.status,
  });

  return appointment;
};

const validateBookingWindow = async (doctorId, clinicId) => {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  // Booking-window rule (startTime) is currently only defined on the doctor's
  // primary clinic record; secondary clinic associations don't yet carry their
  // own startTime restriction — only their dayOfWeek/startTime/endTime schedule window.
  if (clinicId !== doctor.clinicId || !doctor.startTime) return;

  const settings = await prisma.platformSetting.findFirst();
  const windowMinutes = settings?.bookingWindowMinutes ?? 180;

  const [hours, minutes] = doctor.startTime.split(":").map(Number);

  const now = new Date();
  const doctorStart = new Date(now);
  doctorStart.setHours(hours, minutes, 0, 0);

  const windowStart = new Date(doctorStart.getTime() - windowMinutes * 60000);
  const windowEnd = new Date(doctorStart.getTime() + windowMinutes * 60000);

  if (now < windowStart || now > windowEnd) {
    throw new ApiError(
      400,
      `Online booking for this doctor is only allowed between ${formatTime(windowStart)} and ${formatTime(windowEnd)}`
    );
  }
};

const formatTime = (date) => {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};