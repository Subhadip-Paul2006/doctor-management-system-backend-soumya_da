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

import { getPlatformUsers, PlatformUser } from "../../_data/super-admin-data";

const ROLE_VARIANTS: Record<string, "emergency" | "warning" | "info" | "success" | "neutral"> = {
  SUPER_ADMIN: "emergency",
  ADMIN: "warning",
  CLINIC: "info",
  DOCTOR: "success",
  RECEPTIONIST: "neutral",
  PATIENT: "info",
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>(getPlatformUsers());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [newRole, setNewRole] = useState<PlatformUser["role"]>("ADMIN");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.assignedClinicName && u.assignedClinicName.toLowerCase().includes(q));

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleToggleStatus = (id: string, name: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
    setToastMessage(`User account for ${name} is now ${nextStatus}.`);
  };

  const handleRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
    );
    setToastMessage(`Role for ${selectedUser.name} updated to ${newRole}.`);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Platform Users & Role Management Console"
        description="Inspect system accounts, reassign role permissions, and manage multi-tenant access statuses."
      />

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Total Users</p>
          <p className="mt-1 text-3xl font-black text-navy-900">{users.length}</p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Admins & Super Admins</p>
          <p className="mt-1 text-3xl font-black text-red-600">
            {users.filter((u) => u.role === "SUPER_ADMIN" || u.role === "ADMIN").length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Clinic Owners</p>
          <p className="mt-1 text-3xl font-black text-purple-700">
            {users.filter((u) => u.role === "CLINIC").length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Doctors & Staff</p>
          <p className="mt-1 text-3xl font-black text-medical-700">
            {users.filter((u) => u.role === "DOCTOR" || u.role === "RECEPTIONIST").length}
          </p>
        </Card>

        <Card padding="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Registered Patients</p>
          <p className="mt-1 text-3xl font-black text-emerald-600">
            {users.filter((u) => u.role === "PATIENT").length}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search name, email, phone, clinic..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: "ALL", label: "All Users" },
                { id: "SUPER_ADMIN", label: "Super Admin" },
                { id: "ADMIN", label: "Admin" },
                { id: "CLINIC", label: "Clinic" },
                { id: "DOCTOR", label: "Doctor" },
                { id: "RECEPTIONIST", label: "Receptionist" },
                { id: "PATIENT", label: "Patient" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    roleFilter === tab.id
                      ? "bg-navy-900 text-white shadow-sm"
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

      {/* Master Users List Table */}
      <Card>
        <CardHeader
          title={`Platform Accounts Directory (${filteredUsers.length})`}
          subtitle="Manage role assignments and system access control for platform users"
        />
        <CardBody className="p-0">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-navy-800">
                <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wider text-navy-600">
                  <tr>
                    <th className="px-4 py-3">User Details</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Assigned Clinic</th>
                    <th className="px-4 py-3">Created / Last Login</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-navy-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="md" />
                          <div>
                            <p className="font-bold text-navy-900">{user.name}</p>
                            <p className="text-xs text-navy-500">{user.email} · {user.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={ROLE_VARIANTS[user.role] || "info"}>
                          {user.role}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-xs text-navy-700 font-medium">
                        {user.assignedClinicName || "— (Global Platform)"}
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-navy-900">{user.createdAt}</p>
                        <p className="text-navy-400">Login: {user.lastLogin}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            Change Role
                          </Button>

                          <Button
                            size="sm"
                            variant={user.status === "ACTIVE" ? "danger" : "secondary"}
                            onClick={() => handleToggleStatus(user.id, user.name, user.status)}
                          >
                            {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
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
                title="No Users Found"
                description="No user accounts match your filter query."
                action={
                  <Button size="sm" onClick={() => { setSearchQuery(""); setRoleFilter("ALL"); }}>
                    Reset Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Change Role Modal */}
      {selectedUser && (
        <Modal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Reassign Role Permissions — ${selectedUser.name}`}
        >
          <form onSubmit={handleRoleChange} className="space-y-4 text-sm text-navy-800">
            <div className="bg-navy-50 p-3 rounded-lg">
              <p className="font-bold text-navy-900">{selectedUser.name}</p>
              <p className="text-xs text-navy-500">{selectedUser.email} · Current Role: <strong>{selectedUser.role}</strong></p>
            </div>

            <Select
              label="Select New System Role"
              value={newRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRole(e.target.value as any)}
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Platform Authority)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
              <option value="CLINIC">CLINIC (Clinic Owner / Manager)</option>
              <option value="DOCTOR">DOCTOR (Physician Practitioner)</option>
              <option value="RECEPTIONIST">RECEPTIONIST (Front Desk Operations)</option>
              <option value="PATIENT">PATIENT (Public End-User)</option>
            </Select>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-100">
              <Button variant="outline" type="button" onClick={() => setSelectedUser(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Confirm Role Update
              </Button>
            </div>
          </form>
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
