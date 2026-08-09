export default function DoctorDetailPage({
  params,
}: {
  params: { doctorId: string };
}) {
  return <div>Doctor Profile Page ({params.doctorId})</div>;
}
