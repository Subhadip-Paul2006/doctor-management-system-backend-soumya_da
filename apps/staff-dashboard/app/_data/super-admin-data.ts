export interface PlatformMetrics {
  totalClinics: number;
  approvedClinics: number;
  totalDoctors: number;
  verifiedDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  activeQueues: number;
  pendingApprovals: number;
}

export interface PlatformClinic {
  id: string;
  clinicName: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  isApproved: boolean;
  doctorsCount: number;
  receptionistsCount: number;
  todayAppointments: number;
  registeredDate: string;
  status: "APPROVED" | "PENDING" | "SUSPENDED";
}

export interface PlatformDoctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  fee: number;
  primaryClinicId: string;
  primaryClinicName: string;
  isVerified: boolean;
  queueMode: "LIVE" | "TIME_SLOT" | "PRIVATE";
  avgConsultationMinutes: number;
  totalConsultations: number;
  rating: number;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLINIC" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";
  assignedClinicName?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  lastLogin: string;
}

export interface PlatformSettingsData {
  platformName: string;
  supportEmail: string;
  emergencyHotline: string;
  defaultTimezone: string;
  currency: string;

  // Booking rules
  advanceBookingDays: number;
  cancellationWindowHours: number;
  maxDailyTokensPerDoctor: number;

  // Queue defaults
  defaultConsultationMinutes: number;
  defaultQueueMode: string;
  autoPauseThresholdMinutes: number;

  // Notifications & Security
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  liveSocketChimeEnabled: boolean;
  jwtAccessExpiryMinutes: number;
  jwtRefreshExpiryDays: number;
  requirePasswordComplexity: boolean;
}

export interface PlatformActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  type: "APPROVAL" | "VERIFICATION" | "SETTINGS" | "SECURITY" | "ANNOUNCEMENT";
}

export function getPlatformMetrics(): PlatformMetrics {
  return {
    totalClinics: 14,
    approvedClinics: 12,
    totalDoctors: 38,
    verifiedDoctors: 32,
    totalPatients: 1420,
    todayAppointments: 184,
    activeQueues: 9,
    pendingApprovals: 3,
  };
}

export function getPlatformClinics(): PlatformClinic[] {
  return [
    {
      id: "c1",
      clinicName: "Apollo Clinic",
      ownerName: "Dr. Ramesh Patel",
      ownerEmail: "owner.saltlake@apolloclinic.com",
      phone: "+91 33 2334 5678",
      city: "Kolkata",
      state: "West Bengal",
      address: "Block CA, Sector 1, Salt Lake",
      isApproved: true,
      doctorsCount: 6,
      receptionistsCount: 2,
      todayAppointments: 42,
      registeredDate: "2025-01-15",
      status: "APPROVED",
    },
    {
      id: "c2",
      clinicName: "Fortis Medical Center",
      ownerName: "Dr. Sunita Deshmukh",
      ownerEmail: "admin.fortis@medicalcenter.com",
      phone: "+91 33 4001 9900",
      city: "Kolkata",
      state: "West Bengal",
      address: "730 Anandapur, EM Bypass",
      isApproved: true,
      doctorsCount: 8,
      receptionistsCount: 3,
      todayAppointments: 58,
      registeredDate: "2025-02-10",
      status: "APPROVED",
    },
    {
      id: "c3",
      clinicName: "Medica Super Specialty Clinic",
      ownerName: "Dr. Alok Nath",
      ownerEmail: "contact@medicaclinic.org",
      phone: "+91 33 6652 0000",
      city: "Kolkata",
      state: "West Bengal",
      address: "Mukundapur, EM Bypass",
      isApproved: true,
      doctorsCount: 5,
      receptionistsCount: 2,
      todayAppointments: 31,
      registeredDate: "2025-03-04",
      status: "APPROVED",
    },
    {
      id: "c4",
      clinicName: "Care Plus Polyclinic",
      ownerName: "Dr. Meenakshi Sundaram",
      ownerEmail: "careplus.poly@gmail.com",
      phone: "+91 98309 88776",
      city: "Howrah",
      state: "West Bengal",
      address: "12 GT Road, Shibpur",
      isApproved: false,
      doctorsCount: 3,
      receptionistsCount: 1,
      todayAppointments: 0,
      registeredDate: "2026-08-10",
      status: "PENDING",
    },
    {
      id: "c5",
      clinicName: "City Heart & Health Clinic",
      ownerName: "Dr. Rajesh Gupta",
      ownerEmail: "info@cityheartclinic.in",
      phone: "+91 98311 22334",
      city: "Kolkata",
      state: "West Bengal",
      address: "45 Rashbehari Avenue",
      isApproved: false,
      doctorsCount: 2,
      receptionistsCount: 1,
      todayAppointments: 0,
      registeredDate: "2026-08-12",
      status: "PENDING",
    },
  ];
}

export function getPlatformDoctors(): PlatformDoctor[] {
  return [
    {
      id: "d1",
      name: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      qualification: "MBBS, MD (Cardiology), DM",
      experienceYears: 18,
      fee: 800,
      primaryClinicId: "c1",
      primaryClinicName: "Apollo Clinic, Salt Lake",
      isVerified: true,
      queueMode: "LIVE",
      avgConsultationMinutes: 15,
      totalConsultations: 1240,
      rating: 4.9,
    },
    {
      id: "d5",
      name: "Dr. Rahul Chatterjee",
      specialization: "Pediatrician",
      qualification: "MBBS, DCH, MD (Pediatrics)",
      experienceYears: 12,
      fee: 600,
      primaryClinicId: "c1",
      primaryClinicName: "Apollo Clinic, Salt Lake",
      isVerified: true,
      queueMode: "LIVE",
      avgConsultationMinutes: 12,
      totalConsultations: 890,
      rating: 4.8,
    },
    {
      id: "d8",
      name: "Dr. Ananya Roy",
      specialization: "Dermatologist",
      qualification: "MBBS, MD (Dermatology)",
      experienceYears: 10,
      fee: 700,
      primaryClinicId: "c2",
      primaryClinicName: "Fortis Medical Center",
      isVerified: true,
      queueMode: "TIME_SLOT",
      avgConsultationMinutes: 10,
      totalConsultations: 650,
      rating: 4.7,
    },
    {
      id: "d12",
      name: "Dr. Vikram Sethi",
      specialization: "Orthopedic Surgeon",
      qualification: "MBBS, MS (Orthopedics), FRCS",
      experienceYears: 22,
      fee: 1000,
      primaryClinicId: "c3",
      primaryClinicName: "Medica Super Specialty Clinic",
      isVerified: true,
      queueMode: "LIVE",
      avgConsultationMinutes: 20,
      totalConsultations: 1540,
      rating: 4.9,
    },
    {
      id: "d15",
      name: "Dr. Sneha Paul",
      specialization: "Gynecologist",
      qualification: "MBBS, MS (O&G), DNB",
      experienceYears: 7,
      fee: 650,
      primaryClinicId: "c4",
      primaryClinicName: "Care Plus Polyclinic",
      isVerified: false,
      queueMode: "TIME_SLOT",
      avgConsultationMinutes: 15,
      totalConsultations: 120,
      rating: 4.5,
    },
  ];
}

export function getPlatformUsers(): PlatformUser[] {
  return [
    {
      id: "u-001",
      name: "Subhadip Paul",
      email: "subhadip.superadmin@doctor.com",
      phone: "+91 98000 11111",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      createdAt: "2025-01-01",
      lastLogin: "2026-08-13 10:15",
    },
    {
      id: "u-002",
      name: "Debashis Banerjee",
      email: "debashis.admin@doctor.com",
      phone: "+91 98000 22222",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: "2025-01-10",
      lastLogin: "2026-08-13 09:30",
    },
    {
      id: "u-003",
      name: "Dr. Ramesh Patel",
      email: "owner.saltlake@apolloclinic.com",
      phone: "+91 33 2334 5678",
      role: "CLINIC",
      assignedClinicName: "Apollo Clinic, Salt Lake",
      status: "ACTIVE",
      createdAt: "2025-01-15",
      lastLogin: "2026-08-12 18:20",
    },
    {
      id: "u-004",
      name: "Dr. Subhas Mukherjee",
      email: "subhas.m@apolloclinic.com",
      phone: "+91 98301 23456",
      role: "DOCTOR",
      assignedClinicName: "Apollo Clinic, Salt Lake",
      status: "ACTIVE",
      createdAt: "2025-01-16",
      lastLogin: "2026-08-13 10:05",
    },
    {
      id: "u-005",
      name: "Kavita Sharma",
      email: "kavita.rec@apolloclinic.com",
      phone: "+91 98300 11223",
      role: "RECEPTIONIST",
      assignedClinicName: "Apollo Clinic, Salt Lake",
      status: "ACTIVE",
      createdAt: "2025-01-20",
      lastLogin: "2026-08-13 08:45",
    },
    {
      id: "u-006",
      name: "Anil Kumar",
      email: "anil.kumar@example.com",
      phone: "+91 98301 23456",
      role: "PATIENT",
      status: "ACTIVE",
      createdAt: "2025-03-01",
      lastLogin: "2026-08-12 14:10",
    },
  ];
}

export function getPlatformSettingsData(): PlatformSettingsData {
  return {
    platformName: "Doctor & Clinic Management Platform",
    supportEmail: "support@doctormanagement.com",
    emergencyHotline: "+91 1800 123 4567",
    defaultTimezone: "Asia/Kolkata (IST)",
    currency: "INR (INR)",
    advanceBookingDays: 30,
    cancellationWindowHours: 4,
    maxDailyTokensPerDoctor: 100,
    defaultConsultationMinutes: 15,
    defaultQueueMode: "LIVE",
    autoPauseThresholdMinutes: 45,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    liveSocketChimeEnabled: true,
    jwtAccessExpiryMinutes: 15,
    jwtRefreshExpiryDays: 7,
    requirePasswordComplexity: true,
  };
}

export function getPlatformActivityLogs(): PlatformActivityLog[] {
  return [
    {
      id: "act-101",
      timestamp: "2026-08-13 09:45",
      actorName: "Subhadip Paul",
      actorRole: "SUPER_ADMIN",
      action: "Approved Clinic",
      target: "Apollo Clinic, Salt Lake (c1)",
      type: "APPROVAL",
    },
    {
      id: "act-102",
      timestamp: "2026-08-12 16:30",
      actorName: "Debashis Banerjee",
      actorRole: "ADMIN",
      action: "Verified Doctor Credentials",
      target: "Dr. Subhas Mukherjee (d1)",
      type: "VERIFICATION",
    },
    {
      id: "act-103",
      timestamp: "2026-08-12 11:15",
      actorName: "Subhadip Paul",
      actorRole: "SUPER_ADMIN",
      action: "Updated Platform Settings",
      target: "JWT Refresh Token Expiry -> 7 Days",
      type: "SETTINGS",
    },
    {
      id: "act-104",
      timestamp: "2026-08-11 14:00",
      actorName: "Debashis Banerjee",
      actorRole: "ADMIN",
      action: "Published Global Announcement",
      target: "Scheduled Maintenance Banner",
      type: "ANNOUNCEMENT",
    },
  ];
}
