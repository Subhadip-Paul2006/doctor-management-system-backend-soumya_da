import Link from "next/link";
import { Badge, Button, Card, CardBody } from "@doctor/ui";

export function ClinicCard({ clinic }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-navy-900">{clinic.clinicName}</h3>
            <p className="text-sm text-navy-500">{clinic.address}</p>
            <p className="mt-1 text-xs text-navy-500">
              {clinic.city}, {clinic.state} · {clinic.phone}
            </p>
          </div>
          {clinic.isApproved ? <Badge variant="success">Approved</Badge> : null}
        </div>
        <p className="text-xs text-navy-500">Hours: {clinic.workingHours}</p>
        <div className="pt-1">
          <Link href={`/clinics/${clinic.id}`}>
            <Button variant="outline" size="sm">View Clinic</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
