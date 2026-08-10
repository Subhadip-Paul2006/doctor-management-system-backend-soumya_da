// @doctor/types — shared data contracts & Zod schemas (Phase 01 foundation).
// Domain schemas are defined in later phases from docs/BACKEND_FRONTEND_CONTRACT.md.
import { z } from "zod";

// Smoke-test schema: verifies Zod is consumable from this package in Phase 01.
export const foundationCheckSchema = z.object({
  packageName: z.string(),
  phase: z.literal(1),
});

export { z };
