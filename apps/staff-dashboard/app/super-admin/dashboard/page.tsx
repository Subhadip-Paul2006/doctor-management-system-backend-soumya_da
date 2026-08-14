"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Toast,
} from "@doctor/ui";

import {
  getPlatformMetrics,
  getPlatformClinics,
  getPlatformActivityLogs,
  PlatformClinic,
  PlatformActivityLog,
} from "../../_data/super-admin-data";

const CLINIC_STATUS_VARIANTS: Record<string, "success" | "warning" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
};

const ACTIVITY_TYPE_VARIANTS: Record<string, "info" | "success" | "warning" | "emergency"> = {
  APPROVAL: "success",
  VERIFICATION: "info",
  SETTINGS: "warning",
  ANNOUNCEMENT: "emergency",
};

export default function SuperAdminDashboardPage() {
  const metrics = getPlatformMetrics();
  const [clinics, setClinics] = useState<PlatformClinic[]>(getPlatformClinics());
  const [activityLogs] = useState<PlatformActivityLog[]>(getPlatformActivityLogs());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApproveClinic = (id: string, name: string) => {
    setClinics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isApproved: true, status: "APPROVED" } : c))
    );
    setToastMessage(`Clinic ${name} has been approved and activated.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Administration Command Center"
        description="Global system overview, multi-tenant clinic networks, doctor verifications, and system settings."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/super-admin/clinics">
              <Button size="sm" variant="outline">
                Manage Clinics
              </Button>
            </Link>
            <Link href="/super-admin/doctors">
              <Button size="sm" variant="secondary">
                Verify Doctors
              </Button>
            </Link>
            <Link href="/super-admin/platform-settings">
              <Button size="sm">
                Platform Settings
              </Button>
            </Link>
          </div>
        }
      />

      {/* Environment Status Banner */}
      <div className="bg-navy-900 text-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-medical-400">System Status & Environment</p>
          <p className="text-lg font-bold">Doctor Management System — Platform Production Node</p>
          <p className="text-xs text-navy-300">Version 1.0.0 · Database: PostgreSQL (Supabase) · WebSocket Gateway: Active</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Healthy
          </span>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Clinics Network</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{metrics.totalClinics}</p>
          <p className="mt-1 text-xs text-navy-500">{metrics.approvedClinics} Approved · {metrics.pendingApprovals} Pending</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Registered Doctors</p>
          <p className="mt-1 text-3xl font-black text-medical-700">{metrics.totalDoctors}</p>
          <p className="mt-1 text-xs text-navy-500">{metrics.verifiedDoctors} Credentials Verified</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Platform Patients</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{metrics.totalPatients}</p>
          <p className="mt-1 text-xs text-navy-500">Across all registered clinics</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Today's Total Appointments</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">{metrics.todayAppointments}</p>
          <p className="mt-1 text-xs text-navy-500">{metrics.activeQueues} Active Chamber Queues</p>
        </Card>
      </div>

      {/* Master Clinics Network Table */}
      <Card>
        <CardHeader
          title="Registered Clinics Overview"
          subtitle="Platform clinic networks, attached doctor counts, and approval statuses"
          action={
            <Link href="/super-admin/clinics">
              <Button size="sm" variant="outline">
                View All Clinics
              </Button>
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-800">
              <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                <tr>
                  <th className="px-4 py-3">Clinic Name</th>
                  <th className="px-4 py-3">Owner / Contact</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Doctors</th>
                  <th className="px-4 py-3">Today's Visits</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-navy-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy-900">
                      {clinic.clinicName}
                      <span className="block text-xs font-normal text-navy-400 font-mono">{clinic.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{clinic.ownerName}</p>
                      <p className="text-xs text-navy-500">{clinic.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-700">
                      {clinic.city}, {clinic.state}
                    </td>
                    <td className="px-4 py-3 font-bold text-navy-900">
                      {clinic.doctorsCount}
                    </td>
                    <td className="px-4 py-3 font-bold text-medical-700">
                      {clinic.todayAppointments}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CLINIC_STATUS_VARIANTS[clinic.status] || "neutral"}>
                        {clinic.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {clinic.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveClinic(clinic.id, clinic.clinicName)}
                          >
                            Approve
                          </Button>
                        )}
                        <Link href="/super-admin/clinics">
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Recent System Activity Log */}
      <Card>
        <CardHeader
          title="Recent Platform Activity Audit Log"
          subtitle="System audit trail of administrative approvals, verifications, and settings updates"
        />
        <CardBody className="p-0">
          <div className="divide-y divide-navy-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-navy-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant={ACTIVITY_TYPE_VARIANTS[log.type] || "info"}>
                    {log.type}
                  </Badge>
                  <div>
                    <p className="font-bold text-navy-900 text-sm">{log.action}</p>
                    <p className="text-navy-600">Target: <strong>{log.target}</strong></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy-800">{log.actorName} ({log.actorRole})</p>
                  <p className="text-navy-400 font-mono">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

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
