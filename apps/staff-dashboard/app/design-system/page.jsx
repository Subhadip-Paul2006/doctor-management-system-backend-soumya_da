"use client";

import { useState } from "react";
import {
  Button, Input, Select, Textarea, Checkbox, Radio,
  Card, CardHeader, CardBody, CardFooter,
  Badge, Avatar, Modal, Dropdown, DropdownItem, Tabs, Table, Pagination,
  Alert, Toast, Spinner, Skeleton, SkeletonText, EmptyState,
} from "@doctor/ui";

const STATUS_VARIANTS = ["waiting", "checked-in", "completed", "cancelled", "absent", "emergency"];
const TABLE_COLUMNS = [
  { key: "token", header: "Token" },
  { key: "patient", header: "Patient" },
  { key: "status", header: "Status", render: (row) => <Badge variant={row.status}>{row.status}</Badge> },
];
const TABLE_DATA = [
  { id: 1, token: "#012", patient: "Anil Kumar", status: "completed" },
  { id: 2, token: "#013", patient: "Priya Das", status: "checked-in" },
  { id: 3, token: "#014", patient: "Suresh Roy", status: "waiting" },
];

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [page, setPage] = useState(2);

  return (
    <main className="min-h-screen bg-navy-50 p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-medical-600">Staff Dashboard</p>
          <h1 className="text-2xl font-bold text-navy-900">Phase 02 — Design System Showcase</h1>
          <p className="text-sm text-navy-500">All @doctor/ui primitives rendered with design tokens.</p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Buttons</h2>
          <Card><CardBody className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </CardBody></Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Form controls</h2>
          <Card><CardBody className="grid gap-4 sm:grid-cols-2">
            <Input label="Text input" name="demo" placeholder="Placeholder" hint="Helper text" />
            <Input label="With error" name="err" error="This field is required" />
            <Select label="Select" name="sel" defaultValue="">
              <option value="" disabled>Choose…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
            <Textarea label="Textarea" name="ta" placeholder="Notes…" />
            <Checkbox label="Accept terms" name="terms" />
            <div className="flex items-center gap-6">
              <Radio label="Live queue" name="mode" value="live" defaultChecked />
              <Radio label="Time slot" name="mode" value="slot" />
            </div>
          </CardBody></Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Badges & Avatar</h2>
          <Card><CardBody className="flex flex-wrap items-center gap-2">
            {STATUS_VARIANTS.map((v) => <Badge key={v} variant={v}>{v}</Badge>)}
            <span className="mx-3 text-navy-300">|</span>
            <Avatar name="Subhas Mukherjee" size="md" />
            <Avatar name="Anil Kumar" size="sm" />
            <Avatar src="https://i.pravatar.cc/80?img=12" name="Doctor" size="lg" />
          </CardBody></Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Card anatomy</h2>
          <Card interactive>
            <CardHeader title="Dr. S. Mukherjee" subtitle="MBBS, MD — Cardiology" action={<Badge variant="success">Verified</Badge>} />
            <CardBody>Apollo Clinic, Salt Lake. Fee ₹500. Next slot Token #012.</CardBody>
            <CardFooter className="flex gap-3">
              <Button variant="outline" size="sm">View Profile</Button>
              <Button size="sm">Book Token</Button>
            </CardFooter>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Overlay primitives</h2>
          <Card><CardBody className="flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Dropdown trigger={<span className="inline-flex px-4 py-2 rounded-lg bg-navy-100 text-navy-900 text-sm font-medium">Open Dropdown</span>}>
              <DropdownItem>Profile</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Logout</DropdownItem>
            </Dropdown>
            <Button variant="outline" onClick={() => setToastVisible(true)}>Show Toast</Button>
          </CardBody></Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Tabs</h2>
          <Card><CardBody>
            <Tabs tabs={[
              { value: "overview", label: "Overview", content: "Doctor biography and experience summary." },
              { value: "schedule", label: "Schedule", content: "Weekly working hours per clinic." },
              { value: "reviews", label: "Reviews", content: "Verified patient reviews list." },
            ]} />
          </CardBody></Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Table states</h2>
          <div className="space-y-4">
            <Table columns={TABLE_COLUMNS} data={TABLE_DATA} />
            <Table columns={TABLE_COLUMNS} data={[]} loading />
            <Pagination page={page} totalPages={5} onPageChange={setPage} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-900 mb-3">Feedback & loading states</h2>
          <div className="space-y-4">
            <Alert variant="warning" title="Queue paused">Dr. Mukherjee is on a short break.</Alert>
            <Alert variant="danger">Something went wrong loading today&rsquo;s queue.</Alert>
            <div className="flex items-center gap-3 text-navy-500"><Spinner /> Loading appointments…</div>
            <SkeletonText lines={3} />
            <Card><EmptyState
              title="No Appointments Found"
              description="You haven't booked any consultations yet."
              action={<Button size="sm">Search Doctors</Button>}
            /></Card>
          </div>
        </section>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Booking confirmation">
        Modal body content goes here. Press Escape or the backdrop to close.
      </Modal>
      {toastVisible ? <Toast message="Token #014 booked successfully." variant="success" onClose={() => setToastVisible(false)} /> : null}
    </main>
  );
}
