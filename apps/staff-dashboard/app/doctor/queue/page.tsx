import { PageHeader } from "@doctor/ui";
import { getTodayQueue } from "../../_data/doctor";
import { DoctorQueueController } from "../../_components/DoctorQueueController";

export const metadata = {
  title: "Live Queue Control",
  description: "Call tokens, complete consultations and manage today's patient queue.",
};

export default function DoctorQueuePage() {
  // Mock data — Phase 09 wires GET /api/v1/queue/today + queue mutations.
  const queue = getTodayQueue();

  return (
    <div>
      <PageHeader
        title="Live queue control"
        description="Call the next token, complete or mark absent, and pause the chamber queue."
      />
      <div className="mt-6">
        <DoctorQueueController initial={queue} />
      </div>
    </div>
  );
}
