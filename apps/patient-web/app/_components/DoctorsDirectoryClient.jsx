"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardBody, EmptyState, Input, Select } from "@doctor/ui";
import { DoctorCard } from "./DoctorCard";
import { SPECIALIZATIONS, CITIES } from "../_data/directory";

const SORTS = [
  { value: "relevance", label: "Best match" },
  { value: "experience", label: "Experience (high → low)" },
  { value: "fee-asc", label: "Fee (low → high)" },
];

export function DoctorsDirectoryClient({ doctors, initialFilters }) {
  const router = useRouter();
  const [q, setQ] = useState(initialFilters.q || "");
  const [specialization, setSpecialization] = useState(initialFilters.specialization || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [sort, setSort] = useState("relevance");

  const filtered = useMemo(() => {
    let list = doctors;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(needle) || d.specialization.toLowerCase().includes(needle)
      );
    }
    if (specialization) list = list.filter((d) => d.specialization === specialization);
    if (city) list = list.filter((d) => d.city === city);
    switch (sort) {
      case "experience": return [...list].sort((a, b) => b.experienceYears - a.experienceYears);
      case "fee-asc": return [...list].sort((a, b) => a.fee - b.fee);
      default: return list;
    }
  }, [doctors, q, specialization, city, sort]);

  const activeFilterCount = [q, specialization, city].filter(Boolean).length;

  function clearAll() {
    setQ("");
    setSpecialization("");
    setCity("");
    setSort("relevance");
    router.push("/doctors", { scroll: false });
  }

  return (
    <div>
      <Card className="mb-6">
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Search" name="q" placeholder="Name or specialization" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select label="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
            <option value="">All</option>
            {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="City" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s} value={s.value}>{s.label}</option>)}
          </Select>
        </CardBody>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-navy-500">
          {filtered.length} doctor{filtered.length === 1 ? "" : "s"} found
          {activeFilterCount > 0 ? <> · <Badge variant="info">{activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}</Badge></> : null}
        </p>
        {activeFilterCount > 0 || sort !== "relevance" ? (
          <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      ) : (
        <Card><EmptyState
          title="No doctors match"
          description="Try a broader name, clear specialization or pick another city."
          action={<Button variant="outline" size="sm" onClick={clearAll}>Clear filters</Button>}
        /></Card>
      )}
    </div>
  );
}
