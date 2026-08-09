export default function AdminClinicDetailPage({
  params,
}: {
  params: { clinicId: string };
}) {
  return <div>Admin Clinic Detail Page ({params.clinicId})</div>;
}
