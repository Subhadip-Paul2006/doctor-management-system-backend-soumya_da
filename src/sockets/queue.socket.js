import { getIO } from "../config/socket.config.js";

export const emitQueueUpdate = (doctorId, clinicId, queueData) => {
  const io = getIO();
  io.to(`queue:${doctorId}:${clinicId}`).emit("queueUpdate", queueData);
};

// Fired every time staff advances the queue — "token #X is now being called"
export const emitTokenCalled = (doctorId, clinicId, payload) => {
  const io = getIO();
  io.to(`queue:${doctorId}:${clinicId}`).emit("tokenCalled", payload);
};

// Fired when a specific patient's consultation is marked completed
export const emitAppointmentCompleted = (doctorId, clinicId, payload) => {
  const io = getIO();
  io.to(`queue:${doctorId}:${clinicId}`).emit("appointmentCompleted", payload);
};
export const emitDoctorDelay = (doctorId, clinicId, payload) => {
  const io = getIO();
  io.to(`queue:${doctorId}:${clinicId}`).emit("doctorDelay", payload);
};