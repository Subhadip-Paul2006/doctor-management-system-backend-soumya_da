import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import { findClinicByUserId } from "../clinic/clinic.repository.js";
import { findReceptionistAssignment } from "../queue/queue.repository.js";
import { notifyUser } from "../notification/notification.service.js";
import {
  searchDoctors,
  getBookableClinicsForDoctor,
  findOrCreateQueue,
  getDoctorById,
  getPatientById,
  createAppointmentWithToken,
  createWalkInPatient,
  findAppointmentsForPatient,
  getQueueModeForDoctorClinic,
  getClinicById,
  getWorkingHoursForClinicDay,
  getHolidayForClinicDate,
  getConsultationMinutesForDoctorClinic,
} from "./appointment.repository.js";
import { emitQueueUpdate } from "../../sockets/queue.socket.js";

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

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
  await assertClinicOperational(clinicId, date, { isOnlineBooking: true });
  await validateBookingWindow(doctorId, clinicId);

  return bookAppointmentCore({
    doctorId,
    clinicId,
    patientId: patient.id,
    date,
    bookingSource: "ONLINE",
  });
};

export const bookReceptionAppointment = async (
  user,
  { doctorId, clinicId, date, patientId, newPatient, bookingSource }
) => {
  await assertReceptionBookingAccess(user, clinicId, doctorId);
  await assertBookableClinic(doctorId, clinicId);
  await assertClinicOperational(clinicId, date, { isOnlineBooking: false });

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

  const appointments = await findAppointmentsForPatient(patient.id);

  const appointmentsWithVisibility = await Promise.all(
    appointments.map(async (appt) => {
      const queueMode = await getQueueModeForDoctorClinic(appt.doctorId, appt.clinicId);

      const patientsAhead = Math.max(0, appt.token - appt.queue.currentToken - 1);
      const consultationMinutes = await getConsultationMinutesForDoctorClinic(appt.doctorId, appt.clinicId);
      const estimatedWaitMinutes = patientsAhead * consultationMinutes;

      if (queueMode === "PRIVATE") {
        return {
          ...appt,
          queue: { status: appt.queue.status },
          queueMode: "PRIVATE",
          patientsAhead,
          estimatedWaitMinutes,
        };
      }

      return { ...appt, queueMode: "LIVE", patientsAhead, estimatedWaitMinutes };
    })
  );

  return appointmentsWithVisibility;
};

const assertReceptionBookingAccess = async (user, clinicId, doctorId) => {
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return;

  if (user.role === "CLINIC") {
    const clinic = await findClinicByUserId(user.id);
    if (!clinic || clinic.id !== clinicId) {
      throw new ApiError(403, "You can only book appointments for your own clinic");
    }
    return;
  }

  if (user.role === "RECEPTIONIST") {
    const assignment = await findReceptionistAssignment(user.id, doctorId, clinicId);
    if (!assignment) {
      throw new ApiError(403, "You are not assigned to book appointments for this doctor at this clinic");
    }
    return;
  }

  throw new ApiError(403, "You do not have permission to book this appointment");
};

const assertBookableClinic = async (doctorId, clinicId) => {
  const bookableClinicIds = await getBookableClinicsForDoctor(doctorId);
  if (!bookableClinicIds.includes(clinicId)) {
    throw new ApiError(400, "This doctor is not currently bookable at the specified clinic");
  }
};

const assertClinicOperational = async (clinicId, date, { isOnlineBooking }) => {
  const clinic = await getClinicById(clinicId);
  if (!clinic) throw new ApiError(404, "Clinic not found");

  if (isOnlineBooking && !clinic.onlineConsultationEnabled) {
    throw new ApiError(400, "This clinic does not accept online bookings — please book in person or by phone");
  }

  const holiday = await getHolidayForClinicDate(clinicId, date);
  if (holiday) {
    throw new ApiError(400, `Clinic is closed on this date${holiday.reason ? `: ${holiday.reason}` : ""}`);
  }

  const dayOfWeek = DAY_NAMES[new Date(date).getDay()];
  const hours = await getWorkingHoursForClinicDay(clinicId, dayOfWeek);
  if (hours?.isClosed) {
    throw new ApiError(400, `Clinic is closed on ${dayOfWeek.toLowerCase()}s`);
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

  const queueMode = await getQueueModeForDoctorClinic(doctorId, clinicId);
  const broadcastPayload =
    queueMode === "PRIVATE"
      ? { doctorId, clinicId, date, status: updatedQueue.status }
      : {
          doctorId,
          clinicId,
          date,
          currentToken: updatedQueue.currentToken,
          lastTokenIssued: updatedQueue.lastTokenIssued,
          status: updatedQueue.status,
        };

  emitQueueUpdate(doctorId, clinicId, broadcastPayload);

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (patient?.userId) {
    await notifyUser({
      userId: patient.userId,
      type: "APPOINTMENT_BOOKED",
      title: "Appointment Confirmed",
      message: `Your appointment is confirmed — Token #${appointment.token} for ${date}.`,
      meta: { appointmentId: appointment.id, doctorId, clinicId, date, token: appointment.token },
    });
  }

  return appointment;
};

const validateBookingWindow = async (doctorId, clinicId) => {
  const doctor = await getDoctorById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

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