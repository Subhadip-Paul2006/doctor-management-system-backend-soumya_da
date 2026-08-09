export default function AppointmentDetailPage({
  params,
}: {
  params: { appointmentId: string };
}) {
  return <div>Appointment Detail Page ({params.appointmentId})</div>;
}
