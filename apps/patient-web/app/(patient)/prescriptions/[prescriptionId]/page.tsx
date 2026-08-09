export default function PrescriptionDetailPage({
  params,
}: {
  params: { prescriptionId: string };
}) {
  return <div>Prescription Detail Page ({params.prescriptionId})</div>;
}
