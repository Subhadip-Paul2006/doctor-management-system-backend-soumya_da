import Link from "next/link";
import { Badge, Button, Card, CardBody, EmptyState } from "@doctor/ui";
import { DoctorSearchBar } from "../_components/DoctorSearchBar";
import { DoctorCard } from "../_components/DoctorCard";
import { listDoctors } from "../_data/directory";

const HOW_IT_WORKS = [
  { step: 1, title: "Search & choose", text: "Find a verified doctor by specialization, name or city." },
  { step: 2, title: "Pick a slot or token", text: "Book a time slot or join the live queue instantly." },
  { step: 3, title: "Visit & consult", text: "Show your token, wait your turn and consult." },
];

export default function HomePage() {
  const featured = listDoctors().slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12">
        <div className="text-center">
          <Badge variant="info">Trusted healthcare discovery</Badge>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
            Book with verified doctors, skip the waiting crowd
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-navy-500">
            Search by specialization or city, view clinic timings and secure a live-queue token online.
          </p>
        </div>
        <div className="mt-8">
          <DoctorSearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-navy-900">Featured doctors</h2>
          <Link href="/doctors" className="text-sm font-medium text-medical-700 hover:underline">View all</Link>
        </div>
        {featured.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        ) : (
          <Card><EmptyState title="No doctors listed yet" description="Check back soon — doctors are being onboarded." /></Card>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-xl font-semibold text-navy-900">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s) => (
            <Card key={s.step}>
              <CardBody className="space-y-2 p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-medical-100 text-sm font-bold text-medical-800">{s.step}</span>
                <h3 className="text-base font-semibold text-navy-900">{s.title}</h3>
                <p className="text-sm text-navy-500">{s.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Card className="bg-medical-600 text-white" padding="p-8">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Are you a doctor or clinic owner?</h2>
              <p className="mt-1 text-sm opacity-90">Join the platform to manage appointments, queues and patient flow.</p>
            </div>
            <Link href="/register">
              <Button className="bg-white text-medical-800 hover:bg-medical-50 hover:text-medical-900">Register your practice</Button>
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}
