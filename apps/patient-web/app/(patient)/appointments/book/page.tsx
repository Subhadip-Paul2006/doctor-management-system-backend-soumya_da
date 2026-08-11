import Link from "next/link";
import { Suspense } from "react";
import { Alert, Button, Card, CardBody, PageHeader, Skeleton, SkeletonText } from "@doctor/ui";
import { getDoctorById } from "../../../_data/directory";
import { listAvailableDates, listTimeSlots, getNextTokenEstimate } from "../../../_data/patient";
import { BookingWizard } from "../../../_components/BookingWizard";

export const metadata = {
  title: "Book Appointment",
  description: "Choose a date, pick a slot or live-queue token and confirm your booking.",
};

function BookingFallback() {
  return (
    <Card>
      <CardBody className="space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        <SkeletonText lines={4} />
      </CardBody>
    </Card>
  );
}

function BookingResolver({
  searchParams,
}: {
  searchParams: { doctorId?: string; clinicId?: string };
}) {
  const doctorId = typeof searchParams?.doctorId === "string" ? searchParams.doctorId : "";
  const doctor = doctorId ? getDoctorById(doctorId) : null;

  if (!doctor) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Alert variant="warning" title="No doctor selected">
            Booking starts from a doctor profile or the doctor directory. Pick a doctor first to continue.
          </Alert>
          <Link href="/doctors">
            <Button size="sm">Find doctors</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <BookingWizard
      doctor={doctor}
      dates={listAvailableDates(7)}
      timeSlots={listTimeSlots()}
      nextToken={getNextTokenEstimate()}
      existingPatient={{ name: "", phone: "", age: "", gender: "" }}
    />
  );
}

export default function BookAppointmentPage({
  searchParams,
}: {
  searchParams: { doctorId?: string; clinicId?: string };
}) {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Appointments", href: "/appointments" },
          { label: "Book" },
        ]}
        title="Book an appointment"
        description="Reserve a live-queue token or a time slot in a few steps."
      />
      <div className="mt-6">
        <Suspense fallback={<BookingFallback />}>
          <BookingResolver searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
