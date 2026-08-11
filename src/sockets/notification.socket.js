import { getIO } from "../config/socket.config.js";

// Targets one specific patient's appointment — client joins `appointment:<id>` room
// (e.g. as soon as they open their "My Appointments" / queue status screen).
export const emitAppointmentNotification = (appointmentId, payload) => {
  const io = getIO();
  io.to(`appointment:${appointmentId}`).emit("appointmentNotification", payload);
};

// Targets one specific user's general notification channel — client joins `user:<id>`
// once on login/app-open, independent of which specific screen they're viewing.
// This is what makes every notifyUser() call (appointment booked/cancelled,
// token called, referral created, etc.) arrive live, not just on next poll/refresh.
export const emitNewNotification = (userId, notification) => {
  const io = getIO();
  io.to(`user:${userId}`).emit("newNotification", notification);
};