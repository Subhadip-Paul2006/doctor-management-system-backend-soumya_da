export type AppointmentStatus =
  | "WAITING"
  | "CHECKED_IN"
  | "ABSENT"
  | "COMPLETED"
  | "CANCELLED";

export type BookingSource = "ONLINE" | "RECEPTION" | "WALK_IN" | "PHONE";

export interface Appointment {
  id: string;
  doctorId: string;
  clinicId: string;
  patientId: string;
  queueId: string;
  token: number;
  date: string;
  status: AppointmentStatus;
  bookingSource: BookingSource;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}
