export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CLINIC"
  | "RECEPTIONIST"
  | "DOCTOR"
  | "PATIENT";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
