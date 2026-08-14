"use client";

import { useState, useMemo } from "react";
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
  EmptyState,
} from "@doctor/ui";

import {
  getChamberDoctors,
  getMasterFrontDeskTokens,
  FrontDeskToken,
  ChamberDoctor,
} from "../../_data/receptionist-data";

const STATUS_VARIANTS: Record<string, "checked-in" | "waiting" | "completed" | "cancelled" | "emergency" | "info"> = {
  CHECKED_IN: "checked-in",
  WAITING: "waiting",
  IN_CONSULTATION: "info",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ABSENT: "emergency",
};

export default function ReceptionistAppointmentsPage() {
  const [doctors] = useState<ChamberDoctor[]>(getChamberDoctors());
  const [appointments, setAppointments] = useState<FrontDeskToken[]>(getMasterFrontDeskTokens());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<FrontDeskToken | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New appointment form state
  const [newForm, setNewForm] = useState({
    patientName: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    doctorId: "d1",
    bookingSource: "RECEPTION" as "WALK_IN" | "ONLINE" | "PHONE" | "RECEPTION",
    appointmentTime: "02:00 PM",
    chiefComplaint: "",
  });

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q) ||
        apt.appointmentId.toLowerCase().includes(q) ||
        apt.tokenNumber.toString().includes(q) ||
        apt.chiefComplaint.toLowerCase().includes(q);

      const matchesDoctor = selectedDoctor === "ALL" || apt.doctorId === selectedDoctor;
      const matchesSource = selectedSource === "ALL" || apt.bookingSource === selectedSource;
      const matchesStatus = selectedStatus === "ALL" || apt.status === selectedStatus;

      return matchesSearch && matchesDoctor && matchesSource && matchesStatus;
    });
  }, [appointments, searchQuery, selectedDoctor, selectedSource, selectedStatus]);

  // Metrics
  const totalCount = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "WAITING").length;
  const checkedInCount = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED" || a.status === "ABSENT").length;

  const handleUpdateStatus = (id: string, newStatus: FrontDeskToken["status"], patientName: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setToastMessage(`Appointment ${id} for ${patientName} updated to ${newStatus.replace("_", " ")}.`);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.patientName || !newForm.phone) {
      setToastMessage("Please enter patient name and phone number.");
      return;
    }

    const assignedDoc = doctors.find((d) => d.id === newForm.doctorId);

    const newApt: FrontDeskToken = {
      id: `t-${100 + appointments.length + 1}`,
      tokenNumber: appointments.length + 10,
      appointmentId: `APT-${1000 + appointments.length + 1}`,
      patientId: `P-${400 + appointments.length + 1}`,
      patientName: newForm.patientName,
      patientAge: parseInt(newForm.age) || 30,
      patientGender: newForm.gender,
      patientPhone: newForm.phone,
      patientEmail: newForm.email || `${newForm.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      patientAddress: "Kolkata",
      doctorId: newForm.doctorId,
      doctorName: assignedDoc ? assignedDoc.name : "Dr. Subhas Mukherjee",
      specialization: assignedDoc ? assignedDoc.specialization : "General Medicine",
      chamberNumber: assignedDoc ? assignedDoc.chamberNumber : "Chamber 101",
      bookingSource: newForm.bookingSource,
      status: "WAITING",
      isEmergency: false,
      appointmentTime: newForm.appointmentTime,
      chiefComplaint: newForm.chiefComplaint || "General Consultation",
    };

    setAppointments([newApt, ...appointments]);
    setIsBookModalOpen(false);
    setNewForm({
      patientName: "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      doctorId: "d1",
      bookingSource: "RECEPTION",
      appointmentTime: "02:00 PM",
      chiefComplaint: "",
    });
    setToastMessage(`New appointment booked for ${newApt.patientName} (Token #${newApt.tokenNumber}).`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Master Appointments Console"
        description="View, search, filter, check-in, or schedule appointments for all clinic chambers."
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <title>Appointments Master List</title>
                      <style>
                        body { font-family: sans-serif; padding: 20px; color: #0f172a; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                        th { background: #f1f5f9; }
                        @media print { button { display: none; } }
                      </style>
                    </head>
                    <body>
                      <h2>Apollo Clinic, Salt Lake — Daily Appointments List</h2>
                      <p>Date: ${new Date().toISOString().split("T")[0]}</p>
                      <table>
                        <thead>
                          <tr>
                            <th>Token</th>
                            <th>Patient Name</th>
                            <th>Phone</th>
                            <th>Doctor</th>
                            <th>Time</th>
                            <th>Source</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${filteredAppointments
                            .map(
                              (a) => `
                            <tr>
                              <td>#${a.tokenNumber}</td>
                              <td>${a.patientName}</td>
                              <td>${a.patientPhone}</td>
                              <td>${a.doctorName}</td>
                              <td>${a.appointmentTime}</td>
                              <td>${a.bookingSource}</td>
                              <td>${a.status}</td>
                            </tr>`
                            )
                            .join("")}
                        </tbody>
                      </table>
                      <br/>
                      <button onclick="window.print()" style="padding:8px 16px; background:#0284c7; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Print Master List</button>
                    </body>
                    </html>
                  `);
                  printWindow.document.close();
                }
              }}
            >
              Print Master List
            </Button>
            <Button size="sm" onClick={() => setIsBookModalOpen(true)}>
              + Schedule New Appointment
            </Button>
          </div>
        }
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Booked</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{totalCount}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Waiting Queue</p>
          <p className="mt-1 text-3xl font-black text-amber-600">{waitingCount}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Checked-In Waiting</p>
          <p className="mt-1 text-3xl font-black text-medical-700">{checkedInCount}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Completed Visits</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{completedCount}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Cancelled / Absent</p>
          <p className="mt-1 text-3xl font-black text-red-600">{cancelledCount}</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search patient, phone, token #, ID..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={selectedDoctor}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDoctor(e.target.value)}
                className="w-48"
              >
                <option value="ALL">All Chamber Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedSource}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSource(e.target.value)}
                className="w-44"
              >
                <option value="ALL">All Booking Sources</option>
                <option value="ONLINE">Online Booking</option>
                <option value="WALK_IN">Walk-In Desk</option>
                <option value="PHONE">Phone Booking</option>
                <option value="RECEPTION">Reception Desk</option>
              </Select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-t border-navy-100 pt-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: `All (${totalCount})` },
                { id: "WAITING", label: `Waiting Queue (${waitingCount})` },
                { id: "CHECKED_IN", label: `Checked-In (${checkedInCount})` },
                { id: "COMPLETED", label: `Completed (${completedCount})` },
                { id: "CANCELLED", label: `Cancelled (${cancelledCount})` },
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
          title={`Appointments Master List (${filteredAppointments.length})`}
          subtitle="Click any row to view complete patient details or manage status"
        />
        <CardBody className="p-0">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">Token & ID</th>
                    <th className="px-4 py-3">Patient Details</th>
                    <th className="px-4 py-3">Assigned Doctor</th>
                    <th className="px-4 py-3">Time Slot</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-navy-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-11 items-center justify-center rounded-md bg-medical-50 text-sm font-black text-medical-700 border border-medical-200">
                            #{apt.tokenNumber < 10 ? `0${apt.tokenNumber}` : apt.tokenNumber}
                          </span>
                          <span className="text-xs text-navy-400 font-mono">{apt.appointmentId}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={apt.patientName} size="md" />
                          <div>
                            <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                              {apt.patientName}
                              {apt.isEmergency && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600 border border-red-200">
                                  Emergency
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-navy-500">
                              {apt.patientGender}, {apt.patientAge} Yrs · {apt.patientPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{apt.doctorName}</p>
                        <p className="text-xs text-navy-500">{apt.chamberNumber}</p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{apt.appointmentTime}</p>
                        {apt.arrivalTime && (
                          <p className="text-[11px] text-emerald-600">Arrived: {apt.arrivalTime}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                            apt.bookingSource === "WALK_IN"
                              ? "bg-amber-100 text-amber-800"
                              : apt.bookingSource === "ONLINE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {apt.bookingSource}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[apt.status] || "info"}>
                          {apt.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAppointment(apt)}
                          >
                            View Record
                          </Button>

                          {apt.status === "WAITING" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, "CHECKED_IN", apt.patientName)}
                            >
                              Check In
                            </Button>
                          )}

                          {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateStatus(apt.id, "CANCELLED", apt.patientName)}
                            >
                              Cancel
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
                description="No appointments match your filter options."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setSelectedDoctor("ALL"); setSelectedSource("ALL"); setSelectedStatus("ALL"); }}>
                    Reset Search Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detailed Appointment Modal */}
      {selectedAppointment && (
        <Modal
          open={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title={`Appointment Detail — ${selectedAppointment.appointmentId}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{selectedAppointment.patientName}</p>
                <p className="text-xs text-navy-500">
                  {selectedAppointment.patientGender}, {selectedAppointment.patientAge} Yrs · {selectedAppointment.patientPhone}
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[selectedAppointment.status]}>
                {selectedAppointment.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-3 rounded-lg text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase">Token Number</p>
                <p className="font-bold text-navy-900 text-sm">Token #{selectedAppointment.tokenNumber}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Assigned Chamber</p>
                <p className="font-bold text-navy-900">{selectedAppointment.doctorName}</p>
                <p className="text-navy-500">{selectedAppointment.chamberNumber}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Booking Source</p>
                <p className="font-semibold text-navy-900">{selectedAppointment.bookingSource}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Time Slot</p>
                <p className="font-semibold text-navy-900">{selectedAppointment.appointmentTime}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-navy-500 mb-1">Chief Complaint</p>
              <p className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200">
                {selectedAppointment.chiefComplaint}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              {selectedAppointment.status === "WAITING" && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, "CHECKED_IN", selectedAppointment.patientName);
                    setSelectedAppointment(null);
                  }}
                >
                  Check In Patient
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Appointment Modal */}
      <Modal
        open={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule New Reception Appointment"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4 text-sm">
          <Input
            label="Patient Full Name *"
            placeholder="e.g. Suresh Roy"
            value={newForm.patientName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, patientName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age *"
              type="number"
              placeholder="e.g. 45"
              value={newForm.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, age: e.target.value })}
              required
            />
            <Select
              label="Gender"
              value={newForm.gender}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewForm({ ...newForm, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number *"
              placeholder="10-digit mobile"
              value={newForm.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={newForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assign Chamber Doctor"
              value={newForm.doctorId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewForm({ ...newForm, doctorId: e.target.value })}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </Select>

            <Select
              label="Booking Source"
              value={newForm.bookingSource}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewForm({ ...newForm, bookingSource: e.target.value as any })}
            >
              <option value="RECEPTION">Reception Desk</option>
              <option value="WALK_IN">Walk-In Desk</option>
              <option value="PHONE">Phone Booking</option>
            </Select>
          </div>

          <Input
            label="Chief Complaint / Reason for Visit"
            placeholder="e.g. Fever, Routine checkup"
            value={newForm.chiefComplaint}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, chiefComplaint: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-100">
            <Button variant="outline" type="button" onClick={() => setIsBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm & Issue Token
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
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
