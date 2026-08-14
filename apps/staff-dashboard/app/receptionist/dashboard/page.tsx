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
  EmptyState,
} from "@doctor/ui";

import {
  getFrontDeskProfile,
  getChamberDoctors,
  getMasterFrontDeskTokens,
  getFrontDeskSummaryStats,
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

const DOCTOR_STATUS_VARIANTS: Record<string, "success" | "warning" | "neutral"> = {
  IN_SESSION: "success",
  ON_BREAK: "warning",
  UNAVAILABLE: "neutral",
};

export default function ReceptionistDashboardPage() {
  const { receptionist, clinic } = getFrontDeskProfile();
  const [doctors] = useState<ChamberDoctor[]>(getChamberDoctors());
  const [tokens, setTokens] = useState<FrontDeskToken[]>(getMasterFrontDeskTokens());
  const stats = getFrontDeskSummaryStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Toast
  const [selectedToken, setSelectedToken] = useState<FrontDeskToken | null>(null);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered master tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.patientName.toLowerCase().includes(q) ||
        t.patientPhone.includes(q) ||
        t.tokenNumber.toString().includes(q) ||
        t.appointmentId.toLowerCase().includes(q);

      const matchesDoctor = doctorFilter === "ALL" || t.doctorId === doctorFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

      return matchesSearch && matchesDoctor && matchesStatus;
    });
  }, [tokens, searchQuery, doctorFilter, statusFilter]);

  // Lookup results
  const lookupResults = useMemo(() => {
    if (!lookupQuery.trim()) return [];
    const q = lookupQuery.trim().toLowerCase();
    return tokens.filter(
      (t) =>
        t.patientName.toLowerCase().includes(q) ||
        t.patientPhone.includes(q) ||
        t.patientEmail.toLowerCase().includes(q)
    );
  }, [tokens, lookupQuery]);

  const handleCheckIn = (id: string, name: string) => {
    setTokens((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "CHECKED_IN",
              arrivalTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : t
      )
    );
    setToastMessage(`Patient ${name} marked as Checked-In.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <PageHeader
        title="Front Desk Operations Center"
        description={`${clinic.clinicName}, ${clinic.city} · Receptionist: ${receptionist.name} (${receptionist.role})`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsLookupModalOpen(true)}>
              Search Patient Lookup
            </Button>
            <Link href="/receptionist/queue-desk">
              <Button size="sm" variant="secondary">
                Live Queue Desk
              </Button>
            </Link>
            <Link href="/receptionist/walk-in">
              <Button size="sm">
                + Register Walk-In Patient
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Walk-Ins Today</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{stats.walkInsToday}</p>
          <p className="mt-1 text-[11px] text-navy-400">Direct desk registrations</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Checked-In Waiting</p>
          <p className="mt-1 text-3xl font-black text-medical-700">{stats.checkedInToday}</p>
          <p className="mt-1 text-[11px] text-navy-400">In clinic waiting room</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Tokens Issued</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{stats.tokensIssuedToday}</p>
          <p className="mt-1 text-[11px] text-navy-400">Total appointments & walk-ins</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Completed Visits</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{stats.completedToday}</p>
          <p className="mt-1 text-[11px] text-navy-400">Consultations finished</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Active Chambers</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{stats.activeChambers}</p>
          <p className="mt-1 text-[11px] text-navy-400">Doctors currently on duty</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Priority Cases</p>
          <p className="mt-1 text-3xl font-black text-red-600">{stats.emergencyCount}</p>
          <p className="mt-1 text-[11px] text-navy-400">Emergency tokens flagged</p>
        </Card>
      </div>

      {/* Chamber Doctor Availability Monitor */}
      <Card>
        <CardHeader
          title="Chamber Doctor Availability & Live Queue Status"
          subtitle="Real-time status of doctors present in clinic chambers today"
          action={
            <Link href="/receptionist/queue-desk">
              <Button size="sm" variant="outline">
                Open Queue Console
              </Button>
            </Link>
          }
        />
        <CardBody className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-navy-200 bg-navy-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={doc.name} size="md" />
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-navy-500">{doc.specialization}</p>
                      <p className="text-[11px] text-navy-400 font-mono mt-0.5">{doc.chamberNumber}</p>
                    </div>
                  </div>
                  <Badge variant={DOCTOR_STATUS_VARIANTS[doc.status]}>
                    {doc.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-navy-100 text-center text-xs">
                  <div>
                    <p className="text-navy-400 text-[10px] uppercase font-semibold">Currently Serving</p>
                    <p className="font-black text-medical-700 text-base mt-0.5">
                      {doc.currentToken > 0 ? `#${doc.currentToken < 10 ? `0${doc.currentToken}` : doc.currentToken}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-[10px] uppercase font-semibold">Waiting Patients</p>
                    <p className="font-bold text-navy-900 text-base mt-0.5">{doc.waitingCount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-navy-500 pt-1">
                  <span>Avg: {doc.avgConsultationMinutes} mins/pt</span>
                  <Link href={`/receptionist/queue-desk?doctor=${doc.id}`} className="text-medical-700 font-semibold hover:underline">
                    View Queue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

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
                value={doctorFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDoctorFilter(e.target.value)}
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
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="ALL">All Statuses</option>
                <option value="WAITING">Waiting</option>
                <option value="CHECKED_IN">Checked-In</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Master Operational Token & Appointments Table */}
      <Card>
        <CardHeader
          title={`Today's Master Operational List (${filteredTokens.length})`}
          subtitle="Real-time master list of patients, arrivals, and token queues"
        />
        <CardBody className="p-0">
          {filteredTokens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">Token & ID</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Assigned Doctor</th>
                    <th className="px-4 py-3">Booking Source</th>
                    <th className="px-4 py-3">Scheduled Slot</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredTokens.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-11 items-center justify-center rounded-md bg-medical-50 text-sm font-black text-medical-700 border border-medical-200">
                            #{t.tokenNumber < 10 ? `0${t.tokenNumber}` : t.tokenNumber}
                          </span>
                          <span className="text-xs text-navy-400 font-mono">{t.appointmentId}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.patientName} size="md" />
                          <div>
                            <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                              {t.patientName}
                              {t.isEmergency && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600 border border-red-200">
                                  Emergency
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-navy-500">
                              {t.patientGender}, {t.patientAge} Yrs · {t.patientPhone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{t.doctorName}</p>
                        <p className="text-xs text-navy-500">{t.chamberNumber}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            t.bookingSource === "WALK_IN"
                              ? "bg-amber-100 text-amber-800"
                              : t.bookingSource === "ONLINE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.bookingSource}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{t.appointmentTime}</p>
                        {t.arrivalTime && (
                          <p className="text-[11px] text-emerald-600">Arrived: {t.arrivalTime}</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[t.status] || "info"}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedToken(t)}
                          >
                            View Record
                          </Button>

                          {t.status === "WAITING" && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(t.id, t.patientName)}
                            >
                              Check In
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
                title="No Patient Records Found"
                description="No tokens or appointments match your filter query."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setDoctorFilter("ALL"); setStatusFilter("ALL"); }}>
                    Reset Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Patient Record Detail Modal */}
      {selectedToken && (
        <Modal
          open={!!selectedToken}
          onClose={() => setSelectedToken(null)}
          title={`Front Desk Record — ${selectedToken.patientName}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{selectedToken.patientName}</p>
                <p className="text-xs text-navy-500">
                  {selectedToken.patientGender}, {selectedToken.patientAge} Yrs · {selectedToken.patientPhone}
                </p>
              </div>
              <Badge variant={STATUS_VARIANTS[selectedToken.status]}>
                {selectedToken.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-3 rounded-lg text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase">Token & Appointment</p>
                <p className="font-bold text-navy-900 text-sm">Token #{selectedToken.tokenNumber}</p>
                <p className="font-mono text-navy-500">{selectedToken.appointmentId}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Assigned Chamber</p>
                <p className="font-bold text-navy-900">{selectedToken.doctorName}</p>
                <p className="text-navy-500">{selectedToken.chamberNumber}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Booking Source</p>
                <p className="font-semibold text-navy-900">{selectedToken.bookingSource}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Scheduled Time</p>
                <p className="font-semibold text-navy-900">{selectedToken.appointmentTime}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-navy-500 mb-1">Address & Contact</p>
              <p className="text-navy-800">{selectedToken.patientAddress} · Email: {selectedToken.patientEmail}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-navy-500 mb-1">Chief Complaint</p>
              <p className="p-3 bg-amber-50 rounded-lg text-amber-900 border border-amber-200">
                {selectedToken.chiefComplaint}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-navy-100">
              {selectedToken.status === "WAITING" && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleCheckIn(selectedToken.id, selectedToken.patientName);
                    setSelectedToken(null);
                  }}
                >
                  Check In Patient Now
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedToken(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Patient Lookup Modal */}
      <Modal
        open={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
        title="Quick Patient Search & Directory Lookup"
      >
        <div className="space-y-4 text-sm">
          <Input
            label="Search Patient by Phone Number, Name, or Email"
            placeholder="Type 10-digit mobile or patient name..."
            value={lookupQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLookupQuery(e.target.value)}
          />

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {lookupResults.length > 0 ? (
              lookupResults.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-lg border border-navy-200 bg-navy-50 hover:bg-white flex items-center justify-between transition-all"
                >
                  <div>
                    <p className="font-bold text-navy-900">{p.patientName}</p>
                    <p className="text-xs text-navy-500">
                      Phone: {p.patientPhone} · {p.patientGender}, {p.patientAge} Yrs
                    </p>
                    <p className="text-xs text-navy-400">{p.patientAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-medical-700 text-xs">Token #{p.tokenNumber}</span>
                    <p className="text-[11px] text-navy-500">{p.doctorName}</p>
                  </div>
                </div>
              ))
            ) : lookupQuery ? (
              <p className="text-center py-4 text-xs text-navy-500">No matching patient record found.</p>
            ) : (
              <p className="text-center py-4 text-xs text-navy-400">Type above to search existing patient directory.</p>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-navy-100">
            <Button variant="outline" size="sm" onClick={() => setIsLookupModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
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
