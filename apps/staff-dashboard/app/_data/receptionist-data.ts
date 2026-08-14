export interface ReceptionistProfile {
  id: string;
  name: string;
  phone: string;
  role: string;
}

export interface ClinicInfo {
  id: string;
  clinicName: string;
  address: string;
  city: string;
  phone: string;
}

export interface ChamberDoctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  chamberNumber: string;
  status: "IN_SESSION" | "ON_BREAK" | "UNAVAILABLE";
  currentToken: number;
  lastTokenIssued: number;
  waitingCount: number;
  avgConsultationMinutes: number;
}

export interface FrontDeskToken {
  id: string;
  tokenNumber: number;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  chamberNumber: string;
  bookingSource: "WALK_IN" | "ONLINE" | "PHONE" | "RECEPTION";
  status: "WAITING" | "CHECKED_IN" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "ABSENT";
  isEmergency: boolean;
  appointmentTime: string;
  arrivalTime?: string;
  chiefComplaint: string;
}

export interface FrontDeskSummary {
  walkInsToday: number;
  checkedInToday: number;
  tokensIssuedToday: number;
  completedToday: number;
  activeChambers: number;
  emergencyCount: number;
}

export function getFrontDeskProfile(): { receptionist: ReceptionistProfile; clinic: ClinicInfo } {
  return {
    receptionist: {
      id: "rec-101",
      name: "Kavita Sharma",
      phone: "+91 98300 11223",
      role: "Senior Front Desk Executive",
    },
    clinic: {
      id: "c1",
      clinicName: "Apollo Clinic",
      address: "Block CA, Sector 1, Salt Lake",
      city: "Kolkata",
      phone: "+91 33 2334 5678",
    },
  };
}

export function getChamberDoctors(): ChamberDoctor[] {
  return [
    {
      id: "d1",
      name: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      qualification: "MBBS, MD (Cardiology)",
      chamberNumber: "Chamber 101",
      status: "IN_SESSION",
      currentToken: 12,
      lastTokenIssued: 17,
      waitingCount: 5,
      avgConsultationMinutes: 15,
    },
    {
      id: "d5",
      name: "Dr. Rahul Chatterjee",
      specialization: "Pediatrician",
      qualification: "MBBS, DCH, MD (Pediatrics)",
      chamberNumber: "Chamber 104",
      status: "ON_BREAK",
      currentToken: 3,
      lastTokenIssued: 8,
      waitingCount: 4,
      avgConsultationMinutes: 12,
    },
    {
      id: "d8",
      name: "Dr. Ananya Roy",
      specialization: "Dermatologist",
      qualification: "MBBS, MD (Dermatology)",
      chamberNumber: "Chamber 202",
      status: "IN_SESSION",
      currentToken: 7,
      lastTokenIssued: 14,
      waitingCount: 6,
      avgConsultationMinutes: 10,
    },
    {
      id: "d12",
      name: "Dr. Vikram Sethi",
      specialization: "Orthopedic Surgeon",
      qualification: "MBBS, MS (Orthopedics)",
      chamberNumber: "Chamber 205",
      status: "UNAVAILABLE",
      currentToken: 0,
      lastTokenIssued: 0,
      waitingCount: 0,
      avgConsultationMinutes: 20,
    },
  ];
}

export function getMasterFrontDeskTokens(): FrontDeskToken[] {
  return [
    {
      id: "t-101",
      tokenNumber: 12,
      appointmentId: "APT-1001",
      patientId: "P-301",
      patientName: "Anil Kumar",
      patientAge: 34,
      patientGender: "Male",
      patientPhone: "9830123456",
      patientEmail: "anil.kumar@example.com",
      patientAddress: "Salt Lake, Sector 2, Kolkata",
      doctorId: "d1",
      doctorName: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      chamberNumber: "Chamber 101",
      bookingSource: "ONLINE",
      status: "CHECKED_IN",
      isEmergency: false,
      appointmentTime: "10:30 AM",
      arrivalTime: "10:15 AM",
      chiefComplaint: "Exertional chest discomfort and headache",
    },
    {
      id: "t-102",
      tokenNumber: 13,
      appointmentId: "APT-1002",
      patientId: "P-302",
      patientName: "Soma Banerjee",
      patientAge: 28,
      patientGender: "Female",
      patientPhone: "9831234567",
      patientEmail: "soma.b@example.com",
      patientAddress: "Lake Town, Kolkata",
      doctorId: "d1",
      doctorName: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      chamberNumber: "Chamber 101",
      bookingSource: "ONLINE",
      status: "WAITING",
      isEmergency: false,
      appointmentTime: "11:00 AM",
      arrivalTime: "10:45 AM",
      chiefComplaint: "Post-PCI follow-up checkup",
    },
    {
      id: "t-103",
      tokenNumber: 14,
      appointmentId: "APT-1003",
      patientId: "P-303",
      patientName: "Rahul Verma",
      patientAge: 41,
      patientGender: "Male",
      patientPhone: "9832345678",
      patientEmail: "rahul.verma@example.com",
      patientAddress: "Howrah, Kolkata",
      doctorId: "d1",
      doctorName: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      chamberNumber: "Chamber 101",
      bookingSource: "WALK_IN",
      status: "WAITING",
      isEmergency: true,
      appointmentTime: "11:30 AM",
      arrivalTime: "11:05 AM",
      chiefComplaint: "Acute palpitations and sudden dizziness",
    },
    {
      id: "t-104",
      tokenNumber: 15,
      appointmentId: "APT-1004",
      patientId: "P-304",
      patientName: "Priya Nair",
      patientAge: 30,
      patientGender: "Female",
      patientPhone: "9833456789",
      patientEmail: "priya.nair@example.com",
      patientAddress: "New Town, Action Area 1",
      doctorId: "d1",
      doctorName: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      chamberNumber: "Chamber 101",
      bookingSource: "ONLINE",
      status: "WAITING",
      isEmergency: false,
      appointmentTime: "12:00 PM",
      chiefComplaint: "Follow-up consultation on ECG report",
    },
    {
      id: "t-105",
      tokenNumber: 16,
      appointmentId: "APT-1005",
      patientId: "P-305",
      patientName: "Arjun Sen",
      patientAge: 52,
      patientGender: "Male",
      patientPhone: "9834567890",
      patientEmail: "arjun.sen@example.com",
      patientAddress: "Bidhannagar, Kolkata",
      doctorId: "d1",
      doctorName: "Dr. Subhas Mukherjee",
      specialization: "Cardiologist",
      chamberNumber: "Chamber 101",
      bookingSource: "PHONE",
      status: "WAITING",
      isEmergency: false,
      appointmentTime: "12:30 PM",
      chiefComplaint: "BP log review and medication refill",
    },
    {
      id: "t-106",
      tokenNumber: 3,
      appointmentId: "APT-1006",
      patientId: "P-306",
      patientName: "Baby Aarav Das",
      patientAge: 4,
      patientGender: "Male",
      patientPhone: "9835678901",
      patientEmail: "parent.aarav@example.com",
      patientAddress: "Kankurgachi, Kolkata",
      doctorId: "d5",
      doctorName: "Dr. Rahul Chatterjee",
      specialization: "Pediatrician",
      chamberNumber: "Chamber 104",
      bookingSource: "WALK_IN",
      status: "CHECKED_IN",
      isEmergency: false,
      appointmentTime: "10:15 AM",
      arrivalTime: "10:00 AM",
      chiefComplaint: "High fever and viral cough",
    },
    {
      id: "t-107",
      tokenNumber: 4,
      appointmentId: "APT-1007",
      patientId: "P-307",
      patientName: "Riya Das",
      patientAge: 7,
      patientGender: "Female",
      patientPhone: "9836789012",
      patientEmail: "riya.parent@example.com",
      patientAddress: "Ultadanga, Kolkata",
      doctorId: "d5",
      doctorName: "Dr. Rahul Chatterjee",
      specialization: "Pediatrician",
      chamberNumber: "Chamber 104",
      bookingSource: "ONLINE",
      status: "WAITING",
      isEmergency: false,
      appointmentTime: "10:30 AM",
      chiefComplaint: "Routine vaccination schedule",
    },
    {
      id: "t-108",
      tokenNumber: 7,
      appointmentId: "APT-1008",
      patientId: "P-308",
      patientName: "Meera Iyer",
      patientAge: 26,
      patientGender: "Female",
      patientPhone: "9837890123",
      patientEmail: "meera.iyer@example.com",
      patientAddress: "Gariahat, Kolkata",
      doctorId: "d8",
      doctorName: "Dr. Ananya Roy",
      specialization: "Dermatologist",
      chamberNumber: "Chamber 202",
      bookingSource: "ONLINE",
      status: "CHECKED_IN",
      isEmergency: false,
      appointmentTime: "11:15 AM",
      arrivalTime: "11:00 AM",
      chiefComplaint: "Allergic skin rash and consultation",
    },
  ];
}

export function getFrontDeskSummaryStats(): FrontDeskSummary {
  return {
    walkInsToday: 12,
    checkedInToday: 9,
    tokensIssuedToday: 39,
    completedToday: 24,
    activeChambers: 3,
    emergencyCount: 2,
  };
}

export function searchDirectoryPatients(query: string): FrontDeskToken[] {
  const master = getMasterFrontDeskTokens();
  const q = query.trim().toLowerCase();
  if (!q) return master;
  return master.filter(
    (p) =>
      p.patientName.toLowerCase().includes(q) ||
      p.patientPhone.includes(q) ||
      p.tokenNumber.toString().includes(q) ||
      p.appointmentId.toLowerCase().includes(q)
  );
}
