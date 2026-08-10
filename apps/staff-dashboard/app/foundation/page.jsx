import { Button, Card, Input } from "@doctor/ui";
import { formatTokenNumber, cn } from "@doctor/utils";
import { foundationCheckSchema } from "@doctor/types";
import { httpClient } from "@doctor/api-client";

export const metadata = {
  title: "Foundation Smoke Test",
};

export default function FoundationPage() {
  const zodOk = foundationCheckSchema.safeParse({ packageName: "@doctor/types", phase: 1 }).success;

  return (
    <main className={cn("min-h-screen bg-navy-50 text-navy-800 p-8")}>
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-medical-600">
            Staff Dashboard
          </p>
          <h1 className="text-2xl font-bold text-navy-900">Phase 01 Foundation — Smoke Test</h1>
          <p className="text-sm text-navy-500">
            Verifies Next.js App Router, Tailwind v3, and shared packages.
          </p>
        </header>

        <Card>
          <h2 className="text-lg font-medium text-navy-800 mb-3">@doctor/ui primitives</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="mt-4">
            <Input label="Sample input" name="sample" placeholder="Tailwind-styled input" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-medium text-navy-800 mb-2">Shared packages</h2>
          <ul className="text-sm space-y-1">
            <li>@doctor/utils — formatTokenNumber(7) = <strong>{formatTokenNumber(7)}</strong></li>
            <li>@doctor/types — Zod smoke schema valid = <strong>{String(zodOk)}</strong></li>
            <li>@doctor/api-client — httpClient methods = <strong>{Object.keys(httpClient).join(", ")}</strong></li>
            <li>@doctor/config — Tailwind preset consumed via tailwind.config</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
