import { getIO } from "../config/socket.config.js";

// Broadcast the latest queue state to everyone watching this doctor+clinic's queue.
// Room key combines both IDs since a doctor can now have a separate queue per clinic.
export const emitQueueUpdate = (doctorId, clinicId, queueData) => {
  const io = getIO();
  io.to(`queue:${doctorId}:${clinicId}`).emit("queueUpdate", queueData);
};