"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, EmptyState, Tabs } from "@doctor/ui";
import { AppointmentCard } from "./AppointmentCard";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_COPY = {
  all: {
    title: "No appointments yet",
    description: "Book a token with a verified doctor and it will appear here.",
  },
  upcoming: {
    title: "No upcoming appointments",
    description: "You have no scheduled visits. Find a doctor to book one.",
  },
  completed: {
    title: "No completed visits",
    description: "Your past consultations will show up here after your visit.",
  },
  cancelled: {
    title: "No cancelled appointments",
    description: "Appointments you cancel will be listed here.",
  },
};

export function AppointmentsClient({ appointments }) {
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    switch (tab) {
      case "upcoming":
        return appointments.filter((a) => a.status === "WAITING" || a.status === "CHECKED_IN");
      case "completed":
        return appointments.filter((a) => a.status === "COMPLETED");
      case "cancelled":
        return appointments.filter((a) => a.status === "CANCELLED" || a.status === "ABSENT");
      default:
        return appointments;
    }
  }, [appointments, tab]);

  const empty = EMPTY_COPY[tab];

  const tabsContent = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    content: null, // content is rendered once below the tab bar
  }));

  return (
    <div>
      <Tabs tabs={tabsContent} value={tab} onChange={setTab} aria-label="Filter appointments" />
      <div className="mt-4">
        {filtered.length ? (
          <ul className="space-y-3">
            {filtered.map((a) => (
              <li key={a.id}>
                <AppointmentCard appointment={a} />
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <EmptyState
              title={empty.title}
              description={empty.description}
              action={
                <Link href="/doctors">
                  <Button size="sm">Find doctors</Button>
                </Link>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
