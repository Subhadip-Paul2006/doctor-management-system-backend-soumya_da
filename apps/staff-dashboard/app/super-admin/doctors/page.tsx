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

import { getPlatformDoctors, PlatformDoctor } from "../../_data/super-admin-data";

export default function SuperAdminDoctorsPage() {
  const [doctors, setDoctors] = useState<PlatformDoctor[]>(getPlatformDoctors());
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [queueModeFilter, setQueueModeFilter] = useState("ALL");

  // Modals state
  const [selectedDoctor, setSelectedDoctor] = useState<PlatformDoctor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.qualification.toLowerCase().includes(q) ||
        d.primaryClinicName.toLowerCase().includes(q);

      const matchesVerification =
        verificationFilter === "ALL" ||
        (verificationFilter === "VERIFIED" && d.isVerified) ||
        (verificationFilter === "PENDING" && !d.isVerified);

      const matchesQueueMode = queueModeFilter === "ALL" || d.queueMode === queueModeFilter;

      return matchesSearch && matchesVerification && matchesQueueMode;
    });
  }, [doctors, searchQuery, verificationFilter, queueModeFilter]);

  const handleVerifyDoctor = (id: string, name: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isVerified: true } : d))
    );
    setToastMessage(`Doctor ${name} credentials verified successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Doctors Verification & Directory Console"
        description="Verify medical qualifications, inspect clinic associations, and audit consultation queue settings across platform doctors."
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Registered Doctors</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{doctors.length}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Verified Credentials</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">
            {doctors.filter((d) => d.isVerified).length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Pending Verification</p>
          <p className="mt-1 text-3xl font-black text-amber-600">
            {doctors.filter((d) => !d.isVerified).length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Consultations</p>
          <p className="mt-1 text-3xl font-black text-medical-700">
            {doctors.reduce((sum, d) => sum + d.totalConsultations, 0)}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search doctor, specialization, clinic..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={verificationFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVerificationFilter(e.target.value)}
                className="w-48"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">Verified Credentials</option>
                <option value="PENDING">Pending Verification</option>
              </Select>

              <Select
                value={queueModeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQueueModeFilter(e.target.value)}
                className="w-44"
              >
                <option value="ALL">All Queue Modes</option>
                <option value="LIVE">Live Queue</option>
                <option value="TIME_SLOT">Time Slot</option>
                <option value="PRIVATE">Private Only</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Master Doctors Directory Table */}
      <Card>
        <CardHeader
          title={`Doctors Network Master Directory (${filteredDoctors.length})`}
          subtitle="Click any row to inspect medical qualifications and clinic association records"
        />
        <CardBody className="p-0">
          {filteredDoctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">Doctor Details</th>
                    <th className="px-4 py-3">Specialization & Credentials</th>
                    <th className="px-4 py-3">Primary Clinic</th>
                    <th className="px-4 py-3">Fee & Exp</th>
                    <th className="px-4 py-3">Queue Mode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-navy-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-navy-900">
                        <div className="flex items-center gap-3">
                          <Avatar name={doc.name} size="md" />
                          <div>
                            <p className="font-bold text-navy-900">{doc.name}</p>
                            <p className="text-xs text-navy-400 font-mono">{doc.id} · Rating: {doc.rating}/5.0</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{doc.specialization}</p>
                        <p className="text-xs text-navy-500">{doc.qualification}</p>
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-navy-800">
                        {doc.primaryClinicName}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-medical-700">INR {doc.fee}</p>
                        <p className="text-xs text-navy-500">{doc.experienceYears} Years Exp</p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            doc.queueMode === "LIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.queueMode === "TIME_SLOT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {doc.queueMode}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {doc.isVerified ? (
                          <Badge variant="success">Verified</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDoctor(doc)}
                          >
                            View
                          </Button>

                          {!doc.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyDoctor(doc.id, doc.name)}
                            >
                              Verify
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
                title="No Doctors Found"
                description="No doctor accounts match your search query."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setVerificationFilter("ALL"); setQueueModeFilter("ALL"); }}>
                    Reset Search Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <Modal
          open={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          title={`Doctor Credential Record — ${selectedDoctor.name}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{selectedDoctor.name}</p>
                <p className="text-xs text-navy-500">{selectedDoctor.specialization} · ID: {selectedDoctor.id}</p>
              </div>
              {selectedDoctor.isVerified ? (
                <Badge variant="success">Verified Doctor</Badge>
              ) : (
                <Badge variant="warning">Pending Verification</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-3 rounded-lg text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase">Medical Qualifications</p>
                <p className="font-bold text-navy-900">{selectedDoctor.qualification}</p>
                <p className="text-navy-500">{selectedDoctor.experienceYears} Years Clinical Experience</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Primary Clinic</p>
                <p className="font-bold text-navy-900">{selectedDoctor.primaryClinicName}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Consultation Fee & Mode</p>
                <p className="font-bold text-medical-700">INR {selectedDoctor.fee} ({selectedDoctor.queueMode} Mode)</p>
                <p className="text-navy-500">Avg {selectedDoctor.avgConsultationMinutes} Mins / Consultation</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Consultation Stats</p>
                <p className="font-bold text-navy-900">{selectedDoctor.totalConsultations} Total Visits · Rating {selectedDoctor.rating}/5.0</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              {!selectedDoctor.isVerified && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleVerifyDoctor(selectedDoctor.id, selectedDoctor.name);
                    setSelectedDoctor(null);
                  }}
                >
                  Verify Credentials Now
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(null)}>
                Close Window
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
