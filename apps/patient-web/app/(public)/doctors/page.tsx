import { PageHeader } from "@doctor/ui";
import { listDoctors } from "../../_data/directory";
import { DoctorsDirectoryClient } from "../../_components/DoctorsDirectoryClient";

export const metadata = {
  title: "Find Doctors",
  description: "Search verified doctors by name, specialization and city.",
};

export default function DoctorsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const initialFilters = {
    q: typeof searchParams?.q === "string" ? searchParams.q : "",
    specialization: typeof searchParams?.specialization === "string" ? searchParams.specialization : "",
    city: typeof searchParams?.city === "string" ? searchParams.city : "",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Find Doctors" }]}
        title="Find Doctors"
        description="Browse verified doctors. Use filters to narrow by specialization and city."
      />
      <div className="mt-6">
        <DoctorsDirectoryClient doctors={listDoctors()} initialFilters={initialFilters} />
      </div>
    </div>
  );
}
