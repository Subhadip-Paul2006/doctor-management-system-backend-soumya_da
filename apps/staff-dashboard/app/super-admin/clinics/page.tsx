"use client";

import { useState, useMemo } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Input,
  Select,
  Modal,
  Toast,
  EmptyState,
} from "@doctor/ui";

import { getPlatformClinics, PlatformClinic } from "../../_data/super-admin-data";

const STATUS_VARIANTS: Record<string, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
};

export default function SuperAdminClinicsPage() {
  const [clinics, setClinics] = useState<PlatformClinic[]>(getPlatformClinics());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [selectedClinic, setSelectedClinic] = useState<PlatformClinic | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New clinic form state
  const [newForm, setNewForm] = useState({
    clinicName: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    city: "Kolkata",
    state: "West Bengal",
    address: "",
  });

  const filteredClinics = useMemo(() => {
    return clinics.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.clinicName.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.ownerEmail.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clinics, searchQuery, statusFilter]);

  const handleUpdateStatus = (id: string, newStatus: PlatformClinic["status"], name: string) => {
    setClinics((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus, isApproved: newStatus === "APPROVED" } : c
      )
    );
    setToastMessage(`Clinic ${name} status updated to ${newStatus}.`);
  };

  const handleAddClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.clinicName || !newForm.ownerEmail) {
      setToastMessage("Please fill in clinic name and owner email.");
      return;
    }

    const newClinic: PlatformClinic = {
      id: `c-${100 + clinics.length + 1}`,
      clinicName: newForm.clinicName,
      ownerName: newForm.ownerName || "Clinic Administrator",
      ownerEmail: newForm.ownerEmail,
      phone: newForm.phone || "+91 33 2300 0000",
      city: newForm.city,
      state: newForm.state,
      address: newForm.address || "Kolkata",
      isApproved: true,
      doctorsCount: 1,
      receptionistsCount: 1,
      todayAppointments: 0,
      registeredDate: new Date().toISOString().split("T")[0],
      status: "APPROVED",
    };

    setClinics([newClinic, ...clinics]);
    setIsAddModalOpen(false);
    setNewForm({
      clinicName: "",
      ownerName: "",
      ownerEmail: "",
      phone: "",
      city: "Kolkata",
      state: "West Bengal",
      address: "",
    });
    setToastMessage(`New clinic ${newClinic.clinicName} registered and approved.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Clinics Management Console"
        description="Inspect, verify, approve, activate, or suspend multi-tenant clinic accounts across the platform."
        actions={
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Register New Clinic Account
          </Button>
        }
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Clinics</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{clinics.length}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Approved & Active</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">
            {clinics.filter((c) => c.status === "APPROVED").length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Pending Approval</p>
          <p className="mt-1 text-3xl font-black text-amber-600">
            {clinics.filter((c) => c.status === "PENDING").length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Suspended</p>
          <p className="mt-1 text-3xl font-black text-red-600">
            {clinics.filter((c) => c.status === "SUSPENDED").length}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search clinic name, owner, city, ID..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="ALL">All Clinic Statuses</option>
                <option value="APPROVED">Approved & Active</option>
                <option value="PENDING">Pending Approval</option>
                <option value="SUSPENDED">Suspended</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Master Clinics List Table */}
      <Card>
        <CardHeader
          title={`Clinics Network Master List (${filteredClinics.length})`}
          subtitle="Click any clinic to inspect full profile, doctors, and working schedules"
        />
        <CardBody className="p-0">
          {filteredClinics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">Clinic Name & ID</th>
                    <th className="px-4 py-3">Owner / Administrator</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Doctors</th>
                    <th className="px-4 py-3">Today's Visits</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredClinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-navy-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-navy-900">
                        {clinic.clinicName}
                        <span className="block text-xs font-normal text-navy-400 font-mono">{clinic.id}</span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-navy-900">{clinic.ownerName}</p>
                        <p className="text-xs text-navy-500">{clinic.ownerEmail} · {clinic.phone}</p>
                      </td>

                      <td className="px-4 py-3 text-xs text-navy-700">
                        <p className="font-semibold">{clinic.city}, {clinic.state}</p>
                        <p className="text-navy-400 truncate max-w-xs">{clinic.address}</p>
                      </td>

                      <td className="px-4 py-3 font-bold text-navy-900">
                        {clinic.doctorsCount} Docs
                      </td>

                      <td className="px-4 py-3 font-bold text-medical-700">
                        {clinic.todayAppointments}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[clinic.status] || "neutral"}>
                          {clinic.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClinic(clinic)}
                          >
                            View
                          </Button>

                          {clinic.status === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(clinic.id, "APPROVED", clinic.clinicName)}
                            >
                              Approve
                            </Button>
                          )}

                          {clinic.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateStatus(clinic.id, "SUSPENDED", clinic.clinicName)}
                            >
                              Suspend
                            </Button>
                          )}

                          {clinic.status === "SUSPENDED" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(clinic.id, "APPROVED", clinic.clinicName)}
                            >
                              Reactivate
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
                title="No Clinics Found"
                description="No clinic accounts match your search filters."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}>
                    Reset Search Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Clinic Details Modal */}
      {selectedClinic && (
        <Modal
          open={!!selectedClinic}
          onClose={() => setSelectedClinic(null)}
          title={`Clinic Account Profile — ${selectedClinic.clinicName}`}
        >
          <div className="space-y-4 text-sm text-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div>
                <p className="text-lg font-bold text-navy-900">{selectedClinic.clinicName}</p>
                <p className="text-xs text-navy-500">Registered Date: {selectedClinic.registeredDate} · ID: {selectedClinic.id}</p>
              </div>
              <Badge variant={STATUS_VARIANTS[selectedClinic.status]}>
                {selectedClinic.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-navy-50 p-3 rounded-lg text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase">Owner / Administrator</p>
                <p className="font-bold text-navy-900">{selectedClinic.ownerName}</p>
                <p className="text-navy-500">{selectedClinic.ownerEmail}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Phone & Location</p>
                <p className="font-bold text-navy-900">{selectedClinic.phone}</p>
                <p className="text-navy-500">{selectedClinic.city}, {selectedClinic.state}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Attached Staff</p>
                <p className="font-bold text-navy-900">{selectedClinic.doctorsCount} Doctors · {selectedClinic.receptionistsCount} Receptionists</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase">Today's Visits</p>
                <p className="font-bold text-medical-700">{selectedClinic.todayAppointments} Appointments</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-navy-500 mb-1">Full Address</p>
              <p className="p-3 bg-white rounded-lg border border-navy-200 text-navy-900 font-mono text-xs">
                {selectedClinic.address}, {selectedClinic.city}, {selectedClinic.state}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              {selectedClinic.status === "PENDING" && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedClinic.id, "APPROVED", selectedClinic.clinicName);
                    setSelectedClinic(null);
                  }}
                >
                  Approve Clinic Now
                </Button>
              )}

              {selectedClinic.status === "APPROVED" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    handleUpdateStatus(selectedClinic.id, "SUSPENDED", selectedClinic.clinicName);
                    setSelectedClinic(null);
                  }}
                >
                  Suspend Account
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={() => setSelectedClinic(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Clinic Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Platform Clinic Account"
      >
        <form onSubmit={handleAddClinic} className="space-y-4 text-sm">
          <Input
            label="Clinic Name *"
            placeholder="e.g. Apollo Clinic, Salt Lake"
            value={newForm.clinicName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, clinicName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Owner / Admin Name"
              placeholder="e.g. Dr. Ramesh Patel"
              value={newForm.ownerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, ownerName: e.target.value })}
            />
            <Input
              label="Owner Email Address *"
              type="email"
              placeholder="owner@clinic.com"
              value={newForm.ownerEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, ownerEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone Number"
              placeholder="+91 33 2300 0000"
              value={newForm.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, phone: e.target.value })}
            />
            <Input
              label="City"
              placeholder="Kolkata"
              value={newForm.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, city: e.target.value })}
            />
          </div>

          <Input
            label="Full Street Address"
            placeholder="e.g. Block CA, Sector 1, Salt Lake"
            value={newForm.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewForm({ ...newForm, address: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-navy-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register & Approve Clinic
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
