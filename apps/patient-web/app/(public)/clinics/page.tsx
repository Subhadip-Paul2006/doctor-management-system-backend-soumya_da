import { PageHeader } from "@doctor/ui";
import { listClinics } from "../../_data/directory";
import { ClinicCard } from "../../_components/ClinicCard";

export const metadata = {
  title: "Clinics",
  description: "Browse verified clinic partners.",
};

export default function ClinicsPage() {
  const clinics = listClinics();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Clinics" }]}
        title="Clinics"
        description="Clinics listed on the platform, with live-queue or slot-based booking."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {clinics.map((c) => <ClinicCard key={c.id} clinic={c} />)}
      </div>
    </div>
  );
}
