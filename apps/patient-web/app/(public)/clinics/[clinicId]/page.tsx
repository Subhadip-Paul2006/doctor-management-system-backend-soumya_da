import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader } from "@doctor/ui";
import { getClinicById } from "../../../_data/directory";
import { DoctorCard } from "../../../_components/DoctorCard";

export function generateMetadata({ params }: { params: { clinicId: string } }) {
  const clinic = getClinicById(params.clinicId);
  return { title: clinic ? clinic.clinicName : "Clinic not found" };
}

export default function ClinicProfilePage({ params }: { params: { clinicId: string } }) {
  const clinic = getClinicById(params.clinicId);
  if (!clinic) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader
          title={clinic.clinicName}
          subtitle={`${clinic.city}, ${clinic.state}`}
          action={clinic.isApproved ? <Badge variant="success">Approved</Badge> : null}
        />
        <CardBody className="space-y-3">
          <p className="text-sm text-navy-700">{clinic.address}</p>
          <p className="text-sm text-navy-500">Phone: {clinic.phone}</p>
          <p className="text-sm text-navy-500">Hours: {clinic.workingHours}</p>
          <p className="text-sm text-navy-700 pt-2 border-t border-navy-200">{clinic.about}</p>
        </CardBody>
      </Card>

      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold text-navy-900">Doctors at this clinic</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {clinic.doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      </div>
    </div>
  );
}
