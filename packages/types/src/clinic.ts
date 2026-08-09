export interface Clinic {
  id: string;
  userId: string;
  clinicName: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isApproved: boolean;
  onlineConsultationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
