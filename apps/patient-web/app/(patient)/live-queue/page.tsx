import Link from "next/link";
import { Button, Card, EmptyState, PageHeader } from "@doctor/ui";
import { getActiveQueueSnapshot } from "../../_data/patient";
import { LiveQueueClient } from "../../_components/LiveQueueClient";

export const metadata = {
  title: "Live Queue Tracker",
  description: "Track the current token being called and your position in the queue.",
};

export default function PatientLiveQueuePage() {
  // Mock snapshot — Phase 09: GET /api/v1/queue/today; Phase 10: Socket.io events.
  const snapshot = getActiveQueueSnapshot();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Live Queue" }]}
        title="Live queue tracker"
        description="Watch the queue advance so you arrive right on time."
      />
      <div className="mt-6">
        {snapshot ? (
          <LiveQueueClient snapshot={snapshot} />
        ) : (
          <Card>
            <EmptyState
              title="No active token today"
              description="You don't hold a live-queue token for today. Book an appointment to join a queue."
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
