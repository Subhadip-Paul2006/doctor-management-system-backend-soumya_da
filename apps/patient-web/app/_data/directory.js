// PHASE 04 MOCK DATA — public doctor/clinic discovery.
//
// WHY THIS EXISTS: Public list/detail endpoints (`GET /api/v1/doctors`,
// `GET /api/v1/clinic`, `GET /api/v1/clinic/:id`, `GET /api/v1/reviews`)
// are NOT exposed by the backend (all routes are auth-protected; see
// docs/BACKEND_FRONTEND_CONTRACT.md §2.2/§2.7/§2.9 "TO BE CONFIRMED").
// Phase 04 builds the public UX against this isolated module.
//
// SHAPES mirror the Prisma `Doctor` / `Clinic` models from the contract so a
// real public API can replace this module with no UI changes.
//
// ⚠️ MOCK CONTENT — not verified medical/provider data. Do not ship any
//    hardcoded entry as if it were a real practitioner.

export const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dentist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedist",
];

export const CITIES = ["Kolkata", "Howrah", "Salt Lake", "New Town", "Durgapur"];

export const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Subhas Mukherjee",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experienceYears: 18,
    city: "Salt Lake",
    clinic: { id: "c1", clinicName: "Apollo Clinic", city: "Salt Lake" },
    fee: 500,
    rating: 4.6,
    reviewCount: 212,
    isVerified: true,
    queueMode: "LIVE",
    nextSlot: "Today, 6:30 PM",
    about:
      "Senior interventional cardiologist with 18 years of clinical practice across tertiary cardiac centres in Kolkata. Specialises in preventive cardiology, hypertension management, and post-operative cardiac rehabilitation.",
    languages: ["Bengali", "English", "Hindi"],
    timings: "Mon – Sat, 6:00 PM – 9:00 PM",
  },
  {
    id: "d2",
    name: "Dr. Priya Das",
    specialization: "General Physician",
    qualification: "MBBS",
    experienceYears: 11,
    city: "Kolkata",
    clinic: { id: "c2", clinicName: "City Care Poly Clinic", city: "Kolkata" },
    fee: 350,
    rating: 4.4,
    reviewCount: 148,
    isVerified: true,
    queueMode: "TIME_SLOT",
    nextSlot: "Tomorrow, 10:00 AM",
    about:
      "General physician focused on primary care, fever & infection management, diabetes/thyroid follow-up, and preventive health check-ups for adults and adolescents.",
    languages: ["Bengali", "English"],
    timings: "Mon – Fri, 10:00 AM – 1:00 PM",
  },
  {
    id: "d3",
    name: "Dr. Suresh Roy",
    specialization: "Dentist",
    qualification: "BDS",
    experienceYears: 9,
    city: "Howrah",
    clinic: { id: "c3", clinicName: "Smile Dental Studio", city: "Howrah" },
    fee: 300,
    rating: 4.3,
    reviewCount: 96,
    isVerified: true,
    queueMode: "LIVE",
    nextSlot: "Today, 5:00 PM",
    about:
      "Dental surgeon practising general dentistry, root canal treatment, scaling & polishing, and painless extractions. Emphasis on patient comfort and transparent treatment planning.",
    languages: ["Bengali", "Hindi"],
    timings: "Tue – Sun, 4:00 PM – 8:00 PM",
  },
  {
    id: "d4",
    name: "Dr. Ananya Banerjee",
    specialization: "Dermatologist",
    qualification: "MBBS, DVD",
    experienceYears: 13,
    city: "New Town",
    clinic: { id: "c4", clinicName: "Skin & Cure Clinic", city: "New Town" },
    fee: 600,
    rating: 4.7,
    reviewCount: 181,
    isVerified: true,
    queueMode: "TIME_SLOT",
    nextSlot: "Today, 11:30 AM",
    about:
      "Clinical dermatologist treating acne, eczema, psoriasis, hair fall and pigmentation. Also performs basic dermatosurgical procedures and allergy patch testing.",
    languages: ["Bengali", "English"],
    timings: "Mon – Sat, 11:00 AM – 2:00 PM",
  },
  {
    id: "d5",
    name: "Dr. Rahul Chatterjee",
    specialization: "Pediatrician",
    qualification: "MBBS, DCH",
    experienceYears: 15,
    city: "Kolkata",
    clinic: { id: "c2", clinicName: "City Care Poly Clinic", city: "Kolkata" },
    fee: 450,
    rating: 4.5,
    reviewCount: 167,
    isVerified: true,
    queueMode: "LIVE",
    nextSlot: "Today, 7:00 PM",
    about:
      "Pediatrician managing newborn care, immunisation, growth monitoring and common childhood illnesses. Known for patient, parent-friendly consultations.",
    languages: ["Bengali", "English", "Hindi"],
    timings: "Mon – Sat, 6:00 PM – 9:00 PM",
  },
  {
    id: "d6",
    name: "Dr. Nandini Sen",
    specialization: "Orthopedist",
    qualification: "MBBS, MS (Ortho)",
    experienceYears: 16,
    city: "Durgapur",
    clinic: { id: "c5", clinicName: "Orthocare Durgapur", city: "Durgapur" },
    fee: 550,
    rating: 4.5,
    reviewCount: 134,
    isVerified: true,
    queueMode: "LIVE",
    nextSlot: "Tomorrow, 9:30 AM",
    about:
      "Orthopaedic surgeon with focus on joint pain, fractures, arthritis, sports injuries and post-trauma rehabilitation.",
    languages: ["Bengali", "English"],
    timings: "Tue – Sun, 9:00 AM – 12:00 PM",
  },
];

export const CLINICS = [
  {
    id: "c1",
    clinicName: "Apollo Clinic",
    city: "Salt Lake",
    state: "West Bengal",
    address: "DD-21, Sector I, Salt Lake, Kolkata 700064",
    phone: "+91 33 4001 2200",
    isApproved: true,
    doctorIds: ["d1"],
    workingHours: "Mon – Sat, 9:00 AM – 9:00 PM",
    about:
      "Multi-speciality neighbourhood clinic with cardiology and diagnostics support. Token-based live queue available.",
  },
  {
    id: "c2",
    clinicName: "City Care Poly Clinic",
    city: "Kolkata",
    state: "West Bengal",
    address: "12A, Park Street, Kolkata 700016",
    phone: "+91 33 2287 5566",
    isApproved: true,
    doctorIds: ["d2", "d5"],
    workingHours: "Mon – Sat, 9:00 AM – 9:00 PM",
    about:
      "Poly clinic serving primary care and pediatrics. Accepts both live-queue tokens and time-slot bookings.",
  },
  {
    id: "c3",
    clinicName: "Smile Dental Studio",
    city: "Howrah",
    state: "West Bengal",
    address: "45, GT Road, Howrah 711101",
    phone: "+91 33 2641 8899",
    isApproved: true,
    doctorIds: ["d3"],
    workingHours: "Tue – Sun, 10:00 AM – 8:00 PM",
    about: "Dedicated dental studio with modern sterilisation and live-queue tokens.",
  },
  {
    id: "c4",
    clinicName: "Skin & Cure Clinic",
    city: "New Town",
    state: "West Bengal",
    address: "Action Area II, New Town, Kolkata 700156",
    phone: "+91 33 6140 7777",
    isApproved: true,
    doctorIds: ["d4"],
    workingHours: "Mon – Sat, 10:00 AM – 7:00 PM",
    about: "Dermatology and skin-care clinic with time-slot appointments.",
  },
  {
    id: "c5",
    clinicName: "Orthocare Durgapur",
    city: "Durgapur",
    state: "West Bengal",
    address: "B-Zone, City Centre, Durgapur 713216",
    phone: "+91 343 254 6677",
    isApproved: true,
    doctorIds: ["d6"],
    workingHours: "Tue – Sun, 9:00 AM – 12:00 PM",
    about: "Orthopaedic clinic servicing morning consultations on live tokens.",
  },
];

// Simple lookup helpers — same signatures a future API client would expose.
export function listDoctors() {
  return DOCTORS;
}

export function listClinics() {
  return CLINICS;
}

export function getDoctorById(id) {
  return DOCTORS.find((d) => d.id === id) || null;
}

export function getClinicById(id) {
  const clinic = CLINICS.find((c) => c.id === id) || null;
  if (!clinic) return null;
  return {
    ...clinic,
    doctors: clinic.doctorIds
      .map((id) => DOCTORS.find((d) => d.id === id))
      .filter((d) => d !== undefined),
  };
}
