"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  Textarea,
  Toast,
} from "@doctor/ui";

interface MedicineRow {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  instructions: string;
}

export default function CreatePrescriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patientNameParam = searchParams.get("patient") || "";
  const appointmentIdParam = searchParams.get("id") || "";

  // Form states
  const [patientName, setPatientName] = useState(patientNameParam || "Anil Kumar");
  const [patientAge, setPatientAge] = useState("34");
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("+91 98301 23456");
  const [bp, setBp] = useState("135/88 mmHg");
  const [pulse, setPulse] = useState("82 bpm");
  const [temp, setTemp] = useState("98.6 °F");
  const [weight, setWeight] = useState("74 kg");

  const [diagnosis, setDiagnosis] = useState("Essential Hypertension, Mild Hyperlipidemia");
  const [chiefComplaints, setChiefComplaints] = useState("Chest discomfort and exertion fatigue");

  const [medicines, setMedicines] = useState<MedicineRow[]>([
    { name: "Tab Telmisartan 40mg", dosage: "1-0-0", timing: "Before Food", duration: "30 Days", instructions: "Early morning" },
    { name: "Tab Atorvastatin 10mg", dosage: "0-0-1", timing: "After Food", duration: "30 Days", instructions: "At bedtime" },
  ]);

  const [labTests, setLabTests] = useState("Fasting Lipid Profile, Serum Creatinine, 12-Lead ECG");
  const [advice, setAdvice] = useState("Low sodium diet (<2g/day), 30 mins brisk walk daily. Avoid fried foods.");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "1-0-1", timing: "After Food", duration: "7 Days", instructions: "" },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleUpdateMedicine = (index: number, field: keyof MedicineRow, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Exporter: TXT Report
  const handleExportTXT = () => {
    const rxNumber = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const textContent = `
===================================================================
                  NEW E-PRESCRIPTION REPORT
===================================================================
Doctor: Dr. Subhas Mukherjee, MBBS MD (Cardiology)
Clinic: Apollo Clinic, Salt Lake, Kolkata
-------------------------------------------------------------------
Prescription ID : ${rxNumber}
Date            : ${new Date().toISOString().split("T")[0]}
Appointment ID  : ${appointmentIdParam || "N/A"}
-------------------------------------------------------------------
PATIENT DETAILS:
Name   : ${patientName}
Age/Sex: ${patientAge} Yrs / ${patientGender}
Phone  : ${patientPhone}

VITALS:
BP: ${bp}  |  Pulse: ${pulse}  |  Temp: ${temp}  |  Weight: ${weight}

-------------------------------------------------------------------
CHIEF COMPLAINTS:
${chiefComplaints}

DIAGNOSIS:
${diagnosis}
-------------------------------------------------------------------
Rx MEDICATIONS:
${medicines
  .map(
    (m, idx) =>
      `${idx + 1}. ${m.name}\n   Dosage: ${m.dosage} | Timing: ${m.timing} | Duration: ${m.duration}${
        m.instructions ? ` | Instructions: ${m.instructions}` : ""
      }`
  )
  .join("\n\n")}

-------------------------------------------------------------------
RECOMMENDED LAB TESTS:
${labTests}

DOCTOR ADVICE:
${advice}
===================================================================
Digital Signature: Dr. Subhas Mukherjee (Verified E-Prescription)
===================================================================
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rxNumber}_${patientName.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage(`Prescription TXT exported for ${patientName}`);
  };

  // Exporter: PDF Print
  const handleExportPDF = () => {
    const rxNumber = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prescription ${rxNumber} - ${patientName}</title>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
        .doctor-title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
        .doctor-sub { font-size: 13px; color: #0284c7; font-weight: 600; }
        .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
        .vitals-grid { display: flex; gap: 16px; background: #eff6ff; padding: 10px; border-radius: 6px; margin-top: 8px; font-size: 12px; font-weight: 600; color: #1e40af; }
        .section-title { font-size: 14px; font-weight: bold; color: #0369a1; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
        .med-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .med-table th { background: #f1f5f9; text-align: left; padding: 8px; border: 1px solid #cbd5e1; color: #334155; }
        .med-table td { padding: 8px; border: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div className="header">
        <div>
          <h1 class="doctor-title">Dr. Subhas Mukherjee</h1>
          <p class="doctor-sub">MBBS, MD (Cardiology) — Senior Cardiologist</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0; font-weight:bold; font-size:14px;">Apollo Clinic, Salt Lake</p>
          <p style="margin:4px 0 0 0;">Date: <strong>${new Date().toISOString().split("T")[0]}</strong></p>
          <p style="margin:4px 0 0 0;"><strong>${rxNumber}</strong></p>
        </div>
      </div>

      <div class="patient-box">
        <div>
          <p style="margin:0;"><strong>Patient Name:</strong> ${patientName}</p>
          <p style="margin:4px 0 0 0;"><strong>Age / Sex:</strong> ${patientAge} Yrs / ${patientGender}</p>
          <p style="margin:4px 0 0 0;"><strong>Contact:</strong> ${patientPhone}</p>
        </div>
      </div>

      <div class="vitals-grid">
        <span>BP: ${bp}</span>
        <span>Pulse: ${pulse}</span>
        <span>Temp: ${temp}</span>
        <span>Weight: ${weight}</span>
      </div>

      <div class="section-title">Chief Complaints & Diagnosis</div>
      <p style="font-size:13px;"><strong>Complaints:</strong> ${chiefComplaints}</p>
      <p style="font-size:13px; color:#0284c7;"><strong>Diagnosis:</strong> ${diagnosis}</p>

      <div class="section-title">Rx — Medications</div>
      <table class="med-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Dosage</th>
            <th>Timing</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medicines
            .map(
              (m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${m.name}</strong></td>
              <td>${m.dosage}</td>
              <td>${m.timing}</td>
              <td>${m.duration}</td>
              <td>${m.instructions || "-"}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="section-title">Lab Tests</div>
      <p style="font-size:13px;">${labTests}</p>

      <div class="section-title">Advice</div>
      <p style="font-size:13px; background:#fffbeb; padding:10px; border-radius:6px;">${advice}</p>

      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background:#0284c7; color:white; border:none; padding:10px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">
          🖨️ Print / Download PDF
        </button>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setToastMessage(`Prescription PDF print window opened for ${patientName}`);
    }
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(`E-Prescription saved successfully for ${patientName}! Redirecting...`);
    setTimeout(() => {
      router.push("/doctor/prescriptions");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="E-Prescription Builder"
        description="Fill patient vitals, diagnosis, medications, and advice to issue an official e-prescription."
        actions={
          <Link href="/doctor/prescriptions">
            <Button variant="outline" size="sm">
              ← Back to Prescriptions Console
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSavePrescription} className="space-y-6">
        {/* Patient Vitals Card */}
        <Card>
          <CardHeader title="1. Patient Profile & Vitals" subtitle="Patient demographic and initial vital signs" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                label="Patient Name *"
                value={patientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientName(e.target.value)}
                required
              />
              <Input
                label="Age (Years)"
                type="number"
                value={patientAge}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientAge(e.target.value)}
              />
              <Select
                label="Gender"
                value={patientGender}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPatientGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <Input
                label="Phone Number"
                value={patientPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-medical-50/60 p-3 rounded-lg border border-medical-100">
              <Input
                label="Blood Pressure"
                value={bp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBp(e.target.value)}
              />
              <Input
                label="Pulse Rate"
                value={pulse}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPulse(e.target.value)}
              />
              <Input
                label="Temperature"
                value={temp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemp(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                value={weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Diagnosis & Complaints */}
        <Card>
          <CardHeader title="2. Clinical Findings & Diagnosis" />
          <CardBody className="space-y-4">
            <Input
              label="Chief Complaints & Symptoms"
              value={chiefComplaints}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChiefComplaints(e.target.value)}
            />
            <Textarea
              label="Primary Diagnosis *"
              value={diagnosis}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosis(e.target.value)}
              required
            />
          </CardBody>
        </Card>

        {/* Prescribed Medications */}
        <Card>
          <CardHeader
            title="3. Prescribed Medications (Rx)"
            subtitle="Add drugs, dosage, timing, and administration instructions"
            action={
              <Button size="sm" type="button" onClick={handleAddMedicine}>
                + Add Medicine
              </Button>
            }
          />
          <CardBody className="space-y-4">
            {medicines.map((med, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-navy-200 bg-navy-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-medical-700">
                    Medicine #{idx + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove Item
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    label="Medicine Name *"
                    placeholder="e.g. Tab Paracetamol 500mg"
                    value={med.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateMedicine(idx, "name", e.target.value)}
                    required
                  />
                  <Select
                    label="Dosage (M-A-N)"
                    value={med.dosage}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateMedicine(idx, "dosage", e.target.value)}
                  >
                    <option value="1-0-0">1-0-0 (Morning)</option>
                    <option value="0-1-0">0-1-0 (Afternoon)</option>
                    <option value="0-0-1">0-0-1 (Night)</option>
                    <option value="1-0-1">1-0-1 (Twice Daily)</option>
                    <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </Select>
                  <Select
                    label="Timing"
                    value={med.timing}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateMedicine(idx, "timing", e.target.value)}
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                  </Select>
                  <Input
                    label="Duration"
                    placeholder="e.g. 7 Days, 1 Month"
                    value={med.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateMedicine(idx, "duration", e.target.value)}
                  />
                </div>

                <Input
                  label="Instructions / Remarks"
                  placeholder="e.g. Take with warm water before sleeping"
                  value={med.instructions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateMedicine(idx, "instructions", e.target.value)}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Labs & Advice */}
        <Card>
          <CardHeader title="4. Lab Tests & Lifestyle Advice" />
          <CardBody className="space-y-4">
            <Input
              label="Recommended Lab Tests"
              placeholder="e.g. Fasting Blood Sugar, Lipid Profile, ECG"
              value={labTests}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabTests(e.target.value)}
            />
            <Textarea
              label="Doctor Advice & Dietary Guidelines"
              placeholder="e.g. Avoid salty food, 30 min daily morning walk"
              value={advice}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdvice(e.target.value)}
            />
          </CardBody>
        </Card>

        {/* Submit & Exporters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-navy-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleExportTXT}>
              📝 Export TXT
            </Button>
            <Button type="button" variant="secondary" onClick={handleExportPDF}>
              📄 Export PDF / Print
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/doctor/prescriptions">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit">
              💾 Save & Issue Prescription
            </Button>
          </div>
        </div>
      </form>

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
