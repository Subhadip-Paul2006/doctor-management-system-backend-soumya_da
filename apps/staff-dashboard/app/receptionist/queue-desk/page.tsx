import { QueueDeskClient } from "../../_components/QueueDeskClient";
import { getFrontDeskContext, getQueueForDoctor } from "../../_data/receptionist";

export default function QueueDeskPage() {
  const { doctors } = getFrontDeskContext();
  const queuesByDoctor: Record<string, any> = {};
  doctors.forEach((d: { id: string }) => {
    queuesByDoctor[d.id] = getQueueForDoctor(d.id);
  });
  return <QueueDeskClient doctors={doctors} queuesByDoctor={queuesByDoctor} />;
}
