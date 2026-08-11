import Link from "next/link";
import { Avatar, Badge, Button } from "@doctor/ui";

export function DoctorCard({ doctor }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-navy-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <Avatar name={doctor.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-navy-900">{doctor.name}</h3>
            {doctor.isVerified ? <Badge variant="success">Verified</Badge> : null}
          </div>
          <p className="text-sm text-navy-500">{doctor.qualification}</p>
          <p className="text-sm text-navy-700">
            {doctor.specialization} · {doctor.experienceYears}+ yrs
          </p>
          <p className="mt-1 text-xs text-navy-500">
            {doctor.clinic.clinicName}, {doctor.clinic.city}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant={doctor.queueMode === "LIVE" ? "info" : "neutral"}>
          {doctor.queueMode === "LIVE" ? "Live queue" : "Time slot"}
        </Badge>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">
          ★ {doctor.rating.toFixed(1)} ({doctor.reviewCount})
        </span>
        <span className="text-navy-500">Fee ₹{doctor.fee}</span>
        <span className="text-navy-500">Next: {doctor.nextSlot}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Link href={`/doctors/${doctor.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">View Profile</Button>
        </Link>
        <Link href={`/appointments/book?doctorId=${doctor.id}&clinicId=${doctor.clinic.id}`} className="flex-1">
          <Button size="sm" className="w-full">Book Token</Button>
        </Link>
      </div>
    </article>
  );
}
