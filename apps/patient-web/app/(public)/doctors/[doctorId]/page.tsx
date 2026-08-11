import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Table, Tabs } from "@doctor/ui";
import { getDoctorById } from "../../../_data/directory";

export function generateMetadata({ params }: { params: { doctorId: string } }) {
  const doctor = getDoctorById(params.doctorId);
  return { title: doctor ? `${doctor.name}, ${doctor.specialization}` : "Doctor not found" };
}

export default function DoctorProfilePage({ params }: { params: { doctorId: string } }) {
  const doctor = getDoctorById(params.doctorId);
  if (!doctor) notFound();

  const reviewRows = [
    { id: 1, date: "Jun 2026", reviewer: "Verified patient", comment: "Very patient listener; wait was minimal on a live token.", rating: 5 },
    { id: 2, date: "May 2026", reviewer: "Follow-up visit", comment: "Clear explanation of medication side-effects.", rating: 4 },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={doctor.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">{doctor.name}</h1>
              {doctor.isVerified ? <Badge variant="success">Verified</Badge> : null}
            </div>
            <p className="mt-1 text-navy-700">{doctor.qualification} · {doctor.specialization}</p>
            <p className="mt-1 text-sm text-navy-500">
              {doctor.experienceYears}+ years · {doctor.clinic.clinicName}, {doctor.clinic.city}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge variant={doctor.queueMode === "LIVE" ? "info" : "neutral"}>
                {doctor.queueMode === "LIVE" ? "Live queue" : "Time slot"}
              </Badge>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">★ {doctor.rating.toFixed(1)} ({doctor.reviewCount})</span>
              <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-navy-700">Fee ₹{doctor.fee}</span>
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-xs text-navy-500">Next available</p>
            <p className="text-sm font-semibold text-navy-900">{doctor.nextSlot}</p>
            <Link href={`/appointments/book?doctorId=${doctor.id}&clinicId=${doctor.clinic.id}`} className="mt-3 inline-block">
              <Button size="sm">Book Appointment</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              value: "overview",
              label: "Overview",
              content: (
                <Card><CardBody className="space-y-4 p-5">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-navy-900">About</h3>
                    <p className="text-sm text-navy-700">{doctor.about}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-navy-900">Languages</h3>
                    <p className="text-sm text-navy-700">{doctor.languages.join(" · ")}</p>
                  </div>
                </CardBody></Card>
              ),
            },
            {
              value: "schedule",
              label: "Clinic & Schedule",
              content: (
                <Card>
                  <CardHeader title={doctor.clinic.clinicName} subtitle={`${doctor.clinic.city} · Timings: ${doctor.timings}`} />
                  <CardBody>
                    <Link href={`/clinics/${doctor.clinic.id}`}>
                      <Button variant="outline" size="sm">View clinic page</Button>
                    </Link>
                  </CardBody>
                </Card>
              ),
            },
            {
              value: "reviews",
              label: "Reviews",
              content: (
                <Table
                  columns={[
                    { key: "date", header: "Date" },
                    { key: "reviewer", header: "Patient" },
                    { key: "comment", header: "Comment" },
                    { key: "rating", header: "Rating", render: (r: any) => <span>★ {r.rating}/5</span> },
                  ]}
                  data={reviewRows}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
