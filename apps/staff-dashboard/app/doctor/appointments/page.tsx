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
  Select,
  Modal,
  Toast,
  Tabs,
  EmptyState,
} from "@doctor/ui";

interface Appointment {
  id: string;
  tokenNumber: number;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  appointmentDate: string;
  timeSlot: string;
  type: "IN_CLINIC" | "VIDEO_CONSULT" | "FOLLOW_UP";
  status: "CHECKED_IN" | "WAITING" | "UPCOMING" | "COMPLETED" | "CANCELLED";
  isEmergency?: boolean;
  chiefComplaint: string;
  vitals?: {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
  };
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "APT-1001",
    tokenNumber: 12,
    patientName: "Anil Kumar",
    age: 34,
    gender: "Male",
    phone: "+91 98301 23456",
    email: "anil.kumar@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "10:30 AM",
    type: "IN_CLINIC",
    status: "CHECKED_IN",
    isEmergency: false,
    chiefComplaint: "Severe chest pain on exertion, mild shortness of breath",
    vitals: { bp: "135/88 mmHg", pulse: "82 bpm", temp: "98.6 °F", weight: "74 kg" },
  },
  {
    id: "APT-1002",
    tokenNumber: 13,
    patientName: "Soma Banerjee",
    age: 28,
    gender: "Female",
    phone: "+91 98312 34567",
    email: "soma.b@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "11:00 AM",
    type: "IN_CLINIC",
    status: "WAITING",
    isEmergency: false,
    chiefComplaint: "Routine cardiac checkup post angioplasty, mild fatigue",
    vitals: { bp: "120/80 mmHg", pulse: "74 bpm", temp: "98.4 °F", weight: "62 kg" },
  },
  {
    id: "APT-1003",
    tokenNumber: 14,
    patientName: "Rahul Verma",
    age: 41,
    gender: "Male",
    phone: "+91 98323 45678",
    email: "rahul.verma@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "11:30 AM",
    type: "IN_CLINIC",
    status: "WAITING",
    isEmergency: true,
    chiefComplaint: "Acute palpitations and dizziness, blood pressure spike",
    vitals: { bp: "155/95 mmHg", pulse: "110 bpm", temp: "99.1 °F", weight: "81 kg" },
  },
  {
    id: "APT-1004",
    tokenNumber: 15,
    patientName: "Priya Nair",
    age: 30,
    gender: "Female",
    phone: "+91 98334 56789",
    email: "priya.nair@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "12:00 PM",
    type: "VIDEO_CONSULT",
    status: "UPCOMING",
    isEmergency: false,
    chiefComplaint: "Follow-up consultation on ECG report and cholesterol medication adjustment",
    vitals: { bp: "124/82 mmHg", pulse: "76 bpm", temp: "98.6 °F", weight: "58 kg" },
  },
  {
    id: "APT-1005",
    tokenNumber: 16,
    patientName: "Arjun Sen",
    age: 52,
    gender: "Male",
    phone: "+91 98345 67890",
    email: "arjun.sen@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "12:30 PM",
    type: "FOLLOW_UP",
    status: "UPCOMING",
    isEmergency: false,
    chiefComplaint: "Hypertension follow-up consultation and BP log review",
    vitals: { bp: "140/90 mmHg", pulse: "78 bpm", temp: "98.2 °F", weight: "79 kg" },
  },
  {
    id: "APT-1006",
    tokenNumber: 9,
    patientName: "Sunita Roy",
    age: 61,
    gender: "Female",
    phone: "+91 98356 78901",
    email: "sunita.roy@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "09:45 AM",
    type: "IN_CLINIC",
    status: "COMPLETED",
    isEmergency: false,
    chiefComplaint: "Annual lipid profile review and heart wellness assessment",
    vitals: { bp: "128/84 mmHg", pulse: "72 bpm", temp: "98.4 °F", weight: "65 kg" },
  },
  {
    id: "APT-1007",
    tokenNumber: 10,
    patientName: "Deepak Ghosh",
    age: 45,
    gender: "Male",
    phone: "+91 98367 89012",
    email: "deepak.ghosh@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "10:00 AM",
    type: "IN_CLINIC",
    status: "COMPLETED",
    isEmergency: false,
    chiefComplaint: "Treadmill Test (TMT) evaluation and clearance certificate",
    vitals: { bp: "130/85 mmHg", pulse: "80 bpm", temp: "98.6 °F", weight: "76 kg" },
  },
  {
    id: "APT-1008",
    tokenNumber: 11,
    patientName: "Meera Iyer",
    age: 26,
    gender: "Female",
    phone: "+91 98378 90123",
    email: "meera.iyer@example.com",
    appointmentDate: "2026-08-13",
    timeSlot: "10:15 AM",
    type: "IN_CLINIC",
    status: "CANCELLED",
    isEmergency: false,
    chiefComplaint: "Mild chest tightness (Patient called to cancel due to travel)",
  },
];

const STATUS_VARIANTS: Record<string, "checked-in" | "waiting" | "completed" | "cancelled" | "emergency" | "info"> = {
  CHECKED_IN: "checked-in",
  WAITING: "waiting",
  UPCOMING: "info",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  // Modals state
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New appointment form state
  const [newForm, setNewForm] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    timeSlot: "02:00 PM",
    type: "IN_CLINIC" as "IN_CLINIC" | "VIDEO_CONSULT" | "FOLLOW_UP",
    chiefComplaint: "",
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        apt.patientName.toLowerCase().includes(query) ||
        apt.phone.includes(query) ||
        apt.id.toLowerCase().includes(query) ||
        apt.tokenNumber.toString().includes(query) ||
        apt.chiefComplaint.toLowerCase().includes(query);

      // Status
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "TODAY" && apt.appointmentDate === "2026-08-13") ||
        apt.status === selectedStatus;

      // Type
      const matchesType = selectedType === "ALL" || apt.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [appointments, searchQuery, selectedStatus, selectedType]);

  // Metrics
  const totalCount = appointments.length;
  const todayCount = appointments.filter((a) => a.appointmentDate === "2026-08-13").length;
  const waitingCheckedIn = appointments.filter((a) => a.status === "WAITING" || a.status === "CHECKED_IN").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  const handleUpdateStatus = (id: string, newStatus: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setToastMessage(`Appointment ${id} status updated to ${newStatus.replace("_", " ")}.`);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.patientName || !newForm.phone) {
      setToastMessage("Please enter patient name and phone number.");
      return;
    }
    const newApt: Appointment = {
      id: `APT-${1000 + appointments.length + 1}`,
      tokenNumber: appointments.length + 10,
      patientName: newForm.patientName,
      age: parseInt(newForm.age) || 30,
      gender: newForm.gender,
      phone: newForm.phone,
      email: newForm.email || `${newForm.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      appointmentDate: "2026-08-13",
      timeSlot: newForm.timeSlot,
      type: newForm.type,
      status: "WAITING",
      isEmergency: false,
      chiefComplaint: newForm.chiefComplaint || "General Cardiology Consultation",
      vitals: { bp: "120/80 mmHg", pulse: "75 bpm", temp: "98.6 °F", weight: "70 kg" },
    };
    setAppointments([newApt, ...appointments]);
    setIsNewModalOpen(false);
    setNewForm({
      patientName: "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      timeSlot: "02:00 PM",
      type: "IN_CLINIC",
      chiefComplaint: "",
    });
    setToastMessage(`New appointment for ${newApt.patientName} scheduled successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Doctor Appointments Console"
        description="View, manage, filter, and schedule patient appointments for Dr. Subhas Mukherjee."
        actions={
          <div className="flex items-center gap-3">
            <Link href="/doctor/queue">
              <Button variant="outline" size="sm">
                ⚡ Open Live Queue Console
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsNewModalOpen(true)}>
              + Schedule New Appointment
            </Button>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Total Scheduled</p>
              <p className="mt-1 text-3xl font-black text-navy-900">{totalCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-2xl text-navy-700">
              📅
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">In Chamber / Waiting</p>
              <p className="mt-1 text-3xl font-black text-medical-700">{waitingCheckedIn}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-medical-100 text-2xl text-medical-700">
              ⌛
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Completed Today</p>
              <p className="mt-1 text-3xl font-black text-emerald-600">{completedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">
              ✅
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-navy-500">Today's Appointments</p>
              <p className="mt-1 text-3xl font-black text-navy-900">{todayCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-700">
              🏥
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="w-full md:w-80">
              <Input
                placeholder="Search patient, token #, phone, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-44"
              >
                <option value="ALL">All Consultation Types</option>
                <option value="IN_CLINIC">In-Clinic Visit</option>
                <option value="VIDEO_CONSULT">Video Consultation</option>
                <option value="FOLLOW_UP">Follow-up Visit</option>
              </Select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-t border-navy-100 pt-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: `All Appointments (${totalCount})` },
                { id: "CHECKED_IN", label: "In Chamber / Checked-in" },
                { id: "WAITING", label: "Waiting Queue" },
                { id: "UPCOMING", label: "Upcoming" },
                { id: "COMPLETED", label: "Completed" },
                { id: "CANCELLED", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedStatus === tab.id
                      ? "bg-medical-600 text-white shadow-sm"
                      : "bg-navy-100 text-navy-700 hover:bg-navy-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Appointments List / Table */}
      <Card>
        <CardHeader
          title={`Appointments List (${filteredAppointments.length})`}
          subtitle="Click any patient row to view medical details or start consultation."
        />
        <CardBody className="p-0">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">Token & ID</th>
                    <th className="px-4 py-3">Patient Details</th>
                    <th className="px-4 py-3">Date & Slot</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Chief Complaint</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-navy-50/80 transition-colors"
                    >
                      {/* Token & ID */}
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-11 items-center justify-center rounded-md bg-medical-50 text-sm font-black text-medical-700 border border-medical-200">
                            #{apt.tokenNumber < 10 ? `0${apt.tokenNumber}` : apt.tokenNumber}
                          </span>
                          <span className="text-xs text-navy-400 font-mono">{apt.id}</span>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.patientName} size="md" />
                          <div>
                            <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                              {apt.patientName}
                              {apt.isEmergency && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600">
                                  🚨 Emergency
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-navy-500">
                              {apt.gender}, {apt.age} yrs · {apt.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{apt.timeSlot}</p>
                        <p className="text-xs text-navy-500">{apt.appointmentDate}</p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                            apt.type === "VIDEO_CONSULT"
                              ? "bg-purple-100 text-purple-700"
                              : apt.type === "FOLLOW_UP"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {apt.type === "VIDEO_CONSULT" && "🎥 Video"}
                          {apt.type === "FOLLOW_UP" && "🔄 Follow-up"}
                          {apt.type === "IN_CLINIC" && "🏥 In-Clinic"}
                        </span>
                      </td>

                      {/* Complaint */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-xs text-navy-700" title={apt.chiefComplaint}>
                          {apt.chiefComplaint}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[apt.status] || "info"}>
                          {apt.status.replace("_", " ")}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPatient(apt)}
                          >
                            👁️ View
                          </Button>

                          {apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && (
                            <Link href={`/doctor/prescriptions/new?patient=${encodeURIComponent(apt.patientName)}&id=${apt.id}`}>
                              <Button size="sm" variant="secondary">
                                💊 Prescribe
                              </Button>
                            </Link>
                          )}

                          {apt.status === "WAITING" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, "CHECKED_IN")}
                            >
                              Call In
                            </Button>
                          )}

                          {apt.status === "CHECKED_IN" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                            >
                              Finish
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Appointments Found"
                description="No patient appointments match your search filter criteria."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedStatus("ALL"); setSelectedType("ALL"); }}>
                    Reset Search Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <Modal
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Appointment Record — ${selectedPatient.patientName}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{selectedPatient.patientName}</p>
                <p className="text-xs text-navy-500">
                  {selectedPatient.gender}, {selectedPatient.age} yrs · {selectedPatient.phone} · {selectedPatient.email}
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[selectedPatient.status]}>
                {selectedPatient.status.replace("_", " ")}
              </Badge>
            </div>

            {/* Appointment specifics */}
            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-navy-500 font-semibold uppercase">Token Number</p>
                <p className="font-bold text-navy-900">Token #{selectedPatient.tokenNumber}</p>
              </div>
              <div>
                <p className="text-xs text-navy-500 font-semibold uppercase">Time Slot</p>
                <p className="font-bold text-navy-900">{selectedPatient.timeSlot} ({selectedPatient.appointmentDate})</p>
              </div>
              <div>
                <p className="text-xs text-navy-500 font-semibold uppercase">Consultation Type</p>
                <p className="font-semibold text-navy-900">{selectedPatient.type}</p>
              </div>
              <div>
                <p className="text-xs text-navy-500 font-semibold uppercase">Appointment ID</p>
                <p className="font-mono text-navy-900">{selectedPatient.id}</p>
              </div>
            </div>

            {/* Patient Vitals */}
            {selectedPatient.vitals && (
              <div>
                <p className="text-xs font-bold uppercase text-medical-700 tracking-wide mb-2">Recorded Vitals</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-medical-50 p-2 rounded border border-medical-100">
                    <p className="text-[10px] text-navy-500">Blood Pressure</p>
                    <p className="font-bold text-navy-900">{selectedPatient.vitals.bp}</p>
                  </div>
                  <div className="bg-medical-50 p-2 rounded border border-medical-100">
                    <p className="text-[10px] text-navy-500">Pulse Rate</p>
                    <p className="font-bold text-navy-900">{selectedPatient.vitals.pulse}</p>
                  </div>
                  <div className="bg-medical-50 p-2 rounded border border-medical-100">
                    <p className="text-[10px] text-navy-500">Temperature</p>
                    <p className="font-bold text-navy-900">{selectedPatient.vitals.temp}</p>
                  </div>
                  <div className="bg-medical-50 p-2 rounded border border-medical-100">
                    <p className="text-[10px] text-navy-500">Weight</p>
                    <p className="font-bold text-navy-900">{selectedPatient.vitals.weight}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chief complaint */}
            <div>
              <p className="text-xs font-bold uppercase text-navy-500 mb-1">Chief Complaint & Symptoms</p>
              <p className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200">
                {selectedPatient.chiefComplaint}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              <Link href={`/doctor/prescriptions/new?patient=${encodeURIComponent(selectedPatient.patientName)}&id=${selectedPatient.id}`}>
                <Button size="sm">
                  💊 Create E-Prescription
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setToastMessage(`SMS reminder sent to ${selectedPatient.phone}`);
                  setSelectedPatient(null);
                }}
              >
                📩 Send Reminder SMS
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Appointment Modal */}
      <Modal
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Schedule New Appointment"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-sm">
          <Input
            label="Patient Name *"
            placeholder="e.g. Rahul Sharma"
            value={newForm.patientName}
            onChange={(e) => setNewForm({ ...newForm, patientName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age *"
              type="number"
              placeholder="e.g. 35"
              value={newForm.age}
              onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
              required
            />
            <Select
              label="Gender"
              value={newForm.gender}
              onChange={(e) => setNewForm({ ...newForm, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number *"
              placeholder="+91 98300 00000"
              value={newForm.phone}
              onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={newForm.email}
              onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Time Slot"
              value={newForm.timeSlot}
              onChange={(e) => setNewForm({ ...newForm, timeSlot: e.target.value })}
            >
              <option value="02:00 PM">02:00 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="03:30 PM">03:30 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
            </Select>

            <Select
              label="Consultation Type"
              value={newForm.type}
              onChange={(e) => setNewForm({ ...newForm, type: e.target.value as any })}
            >
              <option value="IN_CLINIC">In-Clinic Visit</option>
              <option value="VIDEO_CONSULT">Video Consultation</option>
              <option value="FOLLOW_UP">Follow-up Visit</option>
            </Select>
          </div>

          <Input
            label="Chief Complaint / Reason for Visit"
            placeholder="e.g. Mild chest pain, BP checkup"
            value={newForm.chiefComplaint}
            onChange={(e) => setNewForm({ ...newForm, chiefComplaint: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-100">
            <Button variant="outline" type="button" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm & Book Appointment
            </Button>
          </div>
        </form>
      </Modal>

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
