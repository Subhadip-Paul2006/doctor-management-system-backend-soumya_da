export type QueueMode = "LIVE" | "PRIVATE" | "TIME_SLOT";
export type QueueStatus = "OPEN" | "PAUSED" | "CLOSED";

export interface Queue {
  id: string;
  doctorId: string;
  clinicId: string;
  date: string;
  currentToken: number;
  lastTokenIssued: number;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
}
