"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Select, Button } from "@doctor/ui";
import { SPECIALIZATIONS, CITIES } from "../_data/directory";

export function DoctorSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const [city, setCity] = useState("");

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (spec) params.set("specialization", spec);
    if (city) params.set("city", city);
    router.push(params.size > 0 ? `/doctors?${params}` : "/doctors");
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Search doctors"
      className="grid gap-3 rounded-xl bg-white p-4 shadow-card sm:grid-cols-[1fr_200px_170px_auto]"
    >
      <Input
        label={<span className="sr-only">Search doctors</span>}
        name="q"
        placeholder="Doctor name or keyword"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Select label={<span className="sr-only">Specialization</span>} name="specialization" value={spec} onChange={(e) => setSpec(e.target.value)}>
        <option value="">All specializations</option>
        {SPECIALIZATIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Select label={<span className="sr-only">City</span>} name="city" value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">All cities</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </Select>
      <Button type="submit" className="h-[38px] self-end">Search</Button>
    </form>
  );
}
