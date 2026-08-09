import { QueueMode } from "./queue";

export interface Doctor {
  id: string;
  userId: string;
  clinicId: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  fee?: number;
  isVerified: boolean;
  queueMode: QueueMode;
  avgConsultationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}
