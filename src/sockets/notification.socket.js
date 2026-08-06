import { getIO } from "../config/socket.config.js";

// Targets one specific patient's appointment — client joins `appointment:<id>` room
// (e.g. as soon as they open their "My Appointments" / queue status screen).
export const emitAppointmentNotification = (appointmentId, payload) => {
  const io = getIO();
  io.to(`appointment:${appointmentId}`).emit("appointmentNotification", payload);
};