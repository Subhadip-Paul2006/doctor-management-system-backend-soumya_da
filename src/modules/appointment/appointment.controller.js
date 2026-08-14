import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as appointmentService from "./appointment.service.js";
import {
  searchDoctorsSchema,
  bookOnlineAppointmentSchema,
  bookReceptionAppointmentSchema,
  cancelAppointmentSchema,
  rescheduleAppointmentSchema,
} from "./appointment.validation.js";

export const searchDoctors = asyncHandler(async (req, res) => {
  const filters = searchDoctorsSchema.parse(req.query);
  const doctors = await appointmentService.searchForDoctors(filters);
  res.status(200).json(new ApiResponse(true, "Doctors fetched", { doctors }));
});

export const bookOnline = asyncHandler(async (req, res) => {
  const data = bookOnlineAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.bookOnlineAppointment(req.user.id, data);
  res.status(201).json(new ApiResponse(true, "Appointment booked successfully", { appointment }));
});

export const bookReception = asyncHandler(async (req, res) => {
  const data = bookReceptionAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.bookReceptionAppointment(req.user, data);
  res.status(201).json(new ApiResponse(true, "Appointment booked successfully", { appointment }));
});

export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getMyAppointments(req.user.id);
  res.status(200).json(new ApiResponse(true, "Appointments fetched", { appointments }));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const { reason } = cancelAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.cancelAppointment(req.user, req.params.appointmentId, reason);
  res.status(200).json(new ApiResponse(true, "Appointment cancelled", { appointment }));
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date } = rescheduleAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.rescheduleAppointment(req.user, req.params.appointmentId, date);
  res.status(200).json(new ApiResponse(true, "Appointment rescheduled", { appointment }));
});