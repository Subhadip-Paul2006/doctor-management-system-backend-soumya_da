"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Avatar,
  Input,
  Modal,
  Toast,
  EmptyState,
} from "@doctor/ui";

export interface PrescriptionItem {
  id: string;
  rxNumber: string;
  date: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
  };
  diagnosis: string;
  chiefComplaints: string;
  medicines: Array<{
    name: string;
    dosage: string; // e.g. "1-0-1"
    timing: string; // e.g. "After Food"
    duration: string; // e.g. "30 Days"
    instructions?: string;
  }>;
  labTests: string[];
  advice: string;
  followUpDate: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
}

const INITIAL_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: "RX-2026-0891",
    rxNumber: "RX-2026-0891",
    date: "2026-08-13",
    patientName: "Anil Kumar",
    patientAge: 34,
    patientGender: "Male",
    patientPhone: "+91 98301 23456",
    patientEmail: "anil.kumar@example.com",
    vitals: { bp: "135/88 mmHg", pulse: "82 bpm", temp: "98.6 °F", weight: "74 kg" },
    diagnosis: "Essential Hypertension (Grade I), Mild Hyperlipidemia",
    chiefComplaints: "Exertional chest discomfort and headache since 5 days",
    medicines: [
      { name: "Tab Telmisartan 40mg", dosage: "1-0-0", timing: "Before Food", duration: "30 Days", instructions: "Take early morning" },
      { name: "Tab Atorvastatin 10mg", dosage: "0-0-1", timing: "After Food", duration: "30 Days", instructions: "At bedtime" },
      { name: "Tab Aspirin 75mg", dosage: "0-1-0", timing: "After Food", duration: "30 Days", instructions: "Take after lunch" },
    ],
    labTests: ["Fasting Lipid Profile", "Serum Creatinine & Electrolytes", "12-Lead ECG"],
    advice: "Low sodium diet (<2g/day), 30 mins morning brisk walking daily. Avoid fried/fatty foods.",
    followUpDate: "2026-09-12",
    doctorName: "Dr. Subhas Mukherjee",
    doctorSpecialty: "MBBS, MD (Cardiology) — Senior Cardiologist",
    clinicName: "Apollo Clinic, Salt Lake, Kolkata",
  },
  {
    id: "RX-2026-0890",
    rxNumber: "RX-2026-0890",
    date: "2026-08-13",
    patientName: "Soma Banerjee",
    patientAge: 28,
    patientGender: "Female",
    patientPhone: "+91 98312 34567",
    patientEmail: "soma.b@example.com",
    vitals: { bp: "120/80 mmHg", pulse: "74 bpm", temp: "98.4 °F", weight: "62 kg" },
    diagnosis: "Post-PCI Follow-up, Stable Coronary Artery Disease",
    chiefComplaints: "Routine 3-month follow-up after stent placement",
    medicines: [
      { name: "Tab Clopidogrel 75mg", dosage: "1-0-0", timing: "After Food", duration: "60 Days" },
      { name: "Tab Rosuvastatin 20mg", dosage: "0-0-1", timing: "After Food", duration: "60 Days" },
      { name: "Tab Metoprolol Succinate 25mg ER", dosage: "1-0-0", timing: "After Food", duration: "60 Days" },
    ],
    labTests: ["HbA1c", "LFT & KFT", "Echocardiogram"],
    advice: "Continue cardiac rehab exercises. Monitor BP twice weekly.",
    followUpDate: "2026-10-12",
    doctorName: "Dr. Subhas Mukherjee",
    doctorSpecialty: "MBBS, MD (Cardiology) — Senior Cardiologist",
    clinicName: "Apollo Clinic, Salt Lake, Kolkata",
  },
  {
    id: "RX-2026-0889",
    rxNumber: "RX-2026-0889",
    date: "2026-08-12",
    patientName: "Sunita Roy",
    patientAge: 61,
    patientGender: "Female",
    patientPhone: "+91 98356 78901",
    patientEmail: "sunita.roy@example.com",
    vitals: { bp: "128/84 mmHg", pulse: "72 bpm", temp: "98.4 °F", weight: "65 kg" },
    diagnosis: "Type 2 Diabetes Mellitus with Mild Diabetic Cardiomyopathy",
    chiefComplaints: "Occasional breathlessness on walking uphill",
    medicines: [
      { name: "Tab Empagliflozin 10mg", dosage: "1-0-0", timing: "Before Food", duration: "30 Days" },
      { name: "Tab Metformin SR 500mg", dosage: "1-0-1", timing: "After Food", duration: "30 Days" },
      { name: "Tab Ramipril 2.5mg", dosage: "1-0-0", timing: "After Food", duration: "30 Days" },
    ],
    labTests: ["Fasting Blood Sugar", "PPBS", "Urine Albumin Microalbumin"],
    advice: "Strict diabetic diet. Hydrate well (min 2.5L water/day).",
    followUpDate: "2026-09-10",
    doctorName: "Dr. Subhas Mukherjee",
    doctorSpecialty: "MBBS, MD (Cardiology) — Senior Cardiologist",
    clinicName: "Apollo Clinic, Salt Lake, Kolkata",
  },
  {
    id: "RX-2026-0888",
    rxNumber: "RX-2026-0888",
    date: "2026-08-11",
    patientName: "Deepak Ghosh",
    patientAge: 45,
    patientGender: "Male",
    patientPhone: "+91 98367 89012",
    patientEmail: "deepak.ghosh@example.com",
    vitals: { bp: "130/85 mmHg", pulse: "80 bpm", temp: "98.6 °F", weight: "76 kg" },
    diagnosis: "Non-Cardiac Chest Pain, Gastroesophageal Reflux Disease (GERD)",
    chiefComplaints: "Retro-sternal burning after meals, TMT negative",
    medicines: [
      { name: "Cap Pantoprazole 40mg + Domperidone 30mg", dosage: "1-0-0", timing: "Before Food", duration: "14 Days", instructions: "30 mins before breakfast" },
      { name: "Syr Antacid Gel 15ml", dosage: "1-1-1", timing: "After Food", duration: "14 Days" },
    ],
    labTests: ["USG Whole Abdomen"],
    advice: "Avoid spicy/acidic food, late night meals, elevate head end of bed.",
    followUpDate: "2026-08-25",
    doctorName: "Dr. Subhas Mukherjee",
    doctorSpecialty: "MBBS, MD (Cardiology) — Senior Cardiologist",
    clinicName: "Apollo Clinic, Salt Lake, Kolkata",
  },
];

export default function DoctorPrescriptionsPage() {
  const [prescriptions] = useState<PrescriptionItem[]>(INITIAL_PRESCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRx, setSelectedRx] = useState<PrescriptionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = searchQuery.toLowerCase();
      return (
        rx.patientName.toLowerCase().includes(q) ||
        rx.rxNumber.toLowerCase().includes(q) ||
        rx.diagnosis.toLowerCase().includes(q) ||
        rx.medicines.some((m) => m.name.toLowerCase().includes(q))
      );
    });
  }, [prescriptions, searchQuery]);

  // Exporter: Export TXT Report
  const handleExportTXT = (rx: PrescriptionItem) => {
    const textContent = `
===================================================================
                  MEDICAL PRESCRIPTION REPORT
===================================================================
Doctor: ${rx.doctorName}
Specialty: ${rx.doctorSpecialty}
Clinic: ${rx.clinicName}
-------------------------------------------------------------------
Prescription ID : ${rx.rxNumber}
Date            : ${rx.date}
Follow-Up Date  : ${rx.followUpDate}
-------------------------------------------------------------------
PATIENT DETAILS:
Name   : ${rx.patientName}
Age/Sex: ${rx.patientAge} Yrs / ${rx.patientGender}
Phone  : ${rx.patientPhone}
Email  : ${rx.patientEmail}

VITALS:
BP: ${rx.vitals.bp}  |  Pulse: ${rx.vitals.pulse}  |  Temp: ${rx.vitals.temp}  |  Weight: ${rx.vitals.weight}

-------------------------------------------------------------------
CHIEF COMPLAINTS:
${rx.chiefComplaints}

DIAGNOSIS:
${rx.diagnosis}
-------------------------------------------------------------------
Rx MEDICATIONS:
${rx.medicines
  .map(
    (m, idx) =>
      `${idx + 1}. ${m.name}\n   Dosage: ${m.dosage} | Timing: ${m.timing} | Duration: ${m.duration}${
        m.instructions ? ` | Instructions: ${m.instructions}` : ""
      }`
  )
  .join("\n\n")}

-------------------------------------------------------------------
INVESTIGATIONS & LAB TESTS:
${rx.labTests.map((t, idx) => ` - ${t}`).join("\n")}

DOCTOR ADVICE & INSTRUCTIONS:
${rx.advice}
===================================================================
Digital Signature: ${rx.doctorName} (Verified E-Prescription)
===================================================================
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rx.rxNumber}_${rx.patientName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage(`Prescription TXT file downloaded for ${rx.patientName}`);
  };

  // Exporter: Export PDF Report (Creates printable html layout / blob document)
  const handleExportPDF = (rx: PrescriptionItem) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prescription ${rx.rxNumber} - ${rx.patientName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
        .doctor-title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
        .doctor-sub { font-size: 13px; color: #0284c7; font-weight: 600; }
        .clinic-info { text-align: right; font-size: 12px; color: #64748b; }
        .rx-badge { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 14px; }
        .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
        .vitals-grid { display: flex; gap: 16px; background: #eff6ff; padding: 10px; border-radius: 6px; margin-top: 8px; font-size: 12px; font-weight: 600; color: #1e40af; }
        .section-title { font-size: 14px; font-weight: bold; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .med-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .med-table th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; color: #334155; }
        .med-table td { padding: 8px; border: 1px solid #e2e8f0; }
        .footer { margin-top: 50px; border-top: 2px solid #e2e8f0; pt: 16px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div className="header">
        <div>
          <h1 class="doctor-title">${rx.doctorName}</h1>
          <p class="doctor-sub">${rx.doctorSpecialty}</p>
        </div>
        <div class="clinic-info">
          <p style="margin:0; font-weight:bold; font-size:14px; color:#0f172a;">${rx.clinicName}</p>
          <p style="margin:4px 0 0 0;">Date: <strong>${rx.date}</strong></p>
          <p style="margin:4px 0 0 0;"><span class="rx-badge">${rx.rxNumber}</span></p>
        </div>
      </div>

      <div class="patient-box">
        <div>
          <p style="margin:0;"><strong>Patient Name:</strong> ${rx.patientName}</p>
          <p style="margin:4px 0 0 0;"><strong>Age / Sex:</strong> ${rx.patientAge} Yrs / ${rx.patientGender}</p>
          <p style="margin:4px 0 0 0;"><strong>Contact:</strong> ${rx.patientPhone}</p>
        </div>
        <div>
          <p style="margin:0;"><strong>Follow-Up Date:</strong> <span style="color:#b91c1c; font-weight:bold;">${rx.followUpDate}</span></p>
          <p style="margin:4px 0 0 0;"><strong>Email:</strong> ${rx.patientEmail}</p>
        </div>
      </div>

      <div class="vitals-grid">
        <span>BP: ${rx.vitals.bp}</span>
        <span>Pulse: ${rx.vitals.pulse}</span>
        <span>Temp: ${rx.vitals.temp}</span>
        <span>Weight: ${rx.vitals.weight}</span>
      </div>

      <div class="section-title">Chief Complaint & Diagnosis</div>
      <p style="font-size: 13px; margin: 4px 0;"><strong>Complaint:</strong> ${rx.chiefComplaints}</p>
      <p style="font-size: 13px; margin: 4px 0; color: #0284c7;"><strong>Diagnosis:</strong> ${rx.diagnosis}</p>

      <div class="section-title">Rx — Prescribed Medications</div>
      <table class="med-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Dosage (M-A-N)</th>
            <th>Timing</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${rx.medicines
            .map(
              (m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${m.name}</strong></td>
              <td><span style="background:#e0f2fe; padding:2px 6px; border-radius:4px; font-weight:bold;">${m.dosage}</span></td>
              <td>${m.timing}</td>
              <td>${m.duration}</td>
              <td>${m.instructions || "-"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="section-title">Recommended Lab Tests</div>
      <ul style="font-size:13px; margin: 4px 0; padding-left: 20px;">
        ${rx.labTests.map((t) => `<li>${t}</li>`).join("")}
      </ul>

      <div class="section-title">Doctor's Advice & Lifestyle</div>
      <p style="font-size:13px; background:#fffbeb; padding:10px; border-radius:6px; border:1px solid #fef3c7; color:#92400e;">
        ${rx.advice}
      </p>

      <div class="footer">
        <div>Generated via Doctor & Clinic Management System</div>
        <div style="text-align:right;">
          <p style="margin:0; font-weight:bold; font-size:14px; color:#0f172a;">${rx.doctorName}</p>
          <p style="margin:0; font-size:11px;">(Verified E-Signature)</p>
        </div>
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background:#0284c7; color:white; border:none; padding:10px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setToastMessage(`PDF print window opened for prescription ${rx.rxNumber}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="E-Prescriptions Console"
        description="View, manage, export (PDF/TXT), print, and issue patient e-prescriptions."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/doctor/prescriptions/new">
              <Button size="sm">
                + Create New E-Prescription
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Total Prescriptions</p>
              <p className="mt-1 text-3xl font-black text-navy-900">{prescriptions.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-2xl text-navy-700">
              💊
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Issued Today</p>
              <p className="mt-1 text-3xl font-black text-medical-700">
                {prescriptions.filter((p) => p.date === "2026-08-13").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-medical-100 text-2xl text-medical-700">
              📋
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Exported Reports</p>
              <p className="mt-1 text-3xl font-black text-emerald-600">100%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">
              📄
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Active Patients</p>
              <p className="mt-1 text-3xl font-black text-navy-900">4</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl text-purple-700">
              👥
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search by patient, Rx ID, diagnosis, or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/prescriptions/new">
              <Button size="sm" variant="secondary">
                ✏️ Fast Prescription Builder
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((rx) => (
            <Card key={rx.id} interactive className="hover:border-medical-300 transition-all">
              <CardBody className="space-y-4 p-5">
                {/* Prescription Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-100 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={rx.patientName} size="md" />
                    <div>
                      <p className="font-bold text-navy-900 text-base flex items-center gap-2">
                        {rx.patientName}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-medical-50 text-medical-700 border border-medical-200">
                          {rx.rxNumber}
                        </span>
                      </p>
                      <p className="text-xs text-navy-500">
                        {rx.patientGender}, {rx.patientAge} Yrs · {rx.patientPhone} · Date: <strong>{rx.date}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Top quick badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Verified E-Rx</Badge>
                  </div>
                </div>

                {/* Patient Vitals & Diagnosis */}
                <div className="grid md:grid-cols-2 gap-4 bg-navy-50/70 p-3.5 rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-navy-500 uppercase tracking-wide">Diagnosis</p>
                    <p className="font-bold text-navy-900 text-sm mt-0.5">{rx.diagnosis}</p>
                    <p className="text-navy-600 mt-1"><strong>Symptoms:</strong> {rx.chiefComplaints}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-500 uppercase tracking-wide">Recorded Vitals</p>
                    <div className="flex flex-wrap gap-2 mt-1 font-mono text-navy-800">
                      <span className="bg-white px-2 py-1 rounded border border-navy-200">BP: <strong>{rx.vitals.bp}</strong></span>
                      <span className="bg-white px-2 py-1 rounded border border-navy-200">Pulse: <strong>{rx.vitals.pulse}</strong></span>
                      <span className="bg-white px-2 py-1 rounded border border-navy-200">Temp: <strong>{rx.vitals.temp}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Prescribed Medicines Summary */}
                <div>
                  <p className="text-xs font-bold uppercase text-medical-700 tracking-wide mb-2">
                    Prescribed Medicines ({rx.medicines.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {rx.medicines.map((med, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-navy-100 bg-white shadow-2xs text-xs space-y-1">
                        <p className="font-bold text-navy-900">{med.name}</p>
                        <div className="flex items-center justify-between text-navy-600">
                          <span className="bg-medical-50 font-bold px-1.5 py-0.5 rounded text-medical-700 text-[11px]">
                            {med.dosage}
                          </span>
                          <span>{med.timing}</span>
                          <span className="text-navy-400">{med.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Bar & CTAs */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-3 text-xs">
                  <div className="text-navy-500">
                    Follow-up Date: <strong className="text-navy-900">{rx.followUpDate}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Modal */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRx(rx)}
                    >
                      👁️ View Details
                    </Button>

                    {/* PDF Export CTA */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleExportPDF(rx)}
                    >
                      📄 Export PDF
                    </Button>

                    {/* TXT Export CTA */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportTXT(rx)}
                    >
                      📝 Export TXT
                    </Button>

                    {/* Print CTA */}
                    <Button
                      size="sm"
                      onClick={() => handleExportPDF(rx)}
                    >
                      🖨️ Print Rx
                    </Button>

                    {/* SMS / Email CTA */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToastMessage(`Prescription SMS & Email sent to ${rx.patientPhone}`)}
                    >
                      ✉️ Send SMS
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody className="p-8">
              <EmptyState
                title="No Prescriptions Found"
                description="No patient prescriptions match your search criteria."
                action={
                  <Button size="sm" onClick={() => setSearchQuery("")}>
                    Clear Search Query
                  </Button>
                }
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedRx && (
        <Modal
          open={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`E-Prescription Detail — ${selectedRx.rxNumber}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            {/* Header info */}
            <div className="border-b border-navy-100 pb-3">
              <p className="text-lg font-bold text-navy-900">{selectedRx.patientName}</p>
              <p className="text-xs text-navy-500">
                {selectedRx.patientGender}, {selectedRx.patientAge} Yrs · Phone: {selectedRx.patientPhone} · Date: {selectedRx.date}
              </p>
            </div>

            {/* Diagnosis */}
            <div>
              <p className="text-xs font-bold text-navy-500 uppercase">Diagnosis</p>
              <p className="font-semibold text-navy-900 mt-0.5">{selectedRx.diagnosis}</p>
            </div>

            {/* Medicines List */}
            <div>
              <p className="text-xs font-bold text-medical-700 uppercase mb-2">Prescribed Medicines</p>
              <ul className="divide-y divide-navy-100 border border-navy-100 rounded-lg overflow-hidden">
                {selectedRx.medicines.map((m, idx) => (
                  <li key={idx} className="p-3 flex justify-between items-center text-xs bg-navy-50/50">
                    <div>
                      <p className="font-bold text-navy-900">{m.name}</p>
                      <p className="text-navy-500">{m.instructions || "No special instructions"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-medical-700">{m.dosage}</p>
                      <p className="text-navy-500">{m.timing} · {m.duration}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lab tests & Advice */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                <p className="font-bold text-blue-900 mb-1">Recommended Labs</p>
                <ul className="list-disc pl-4 text-blue-800">
                  {selectedRx.labTests.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                <p className="font-bold text-amber-900 mb-1">Diet & Advice</p>
                <p className="text-amber-800">{selectedRx.advice}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              <Button size="sm" variant="outline" onClick={() => handleExportTXT(selectedRx)}>
                📝 Download TXT
              </Button>
              <Button size="sm" onClick={() => handleExportPDF(selectedRx)}>
                📄 Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
