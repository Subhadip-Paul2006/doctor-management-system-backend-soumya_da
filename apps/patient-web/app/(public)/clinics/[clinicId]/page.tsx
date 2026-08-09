export default function ClinicDetailPage({
  params,
}: {
  params: { clinicId: string };
}) {
  return <div>Clinic Detail Page ({params.clinicId})</div>;
}
