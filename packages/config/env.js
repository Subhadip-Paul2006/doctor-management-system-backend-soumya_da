/**
 * Shared environment resolution + Zod validation foundation (Phase 01).
 * Validates the public env vars the frontend apps rely on.
 * CommonJS: this package also hosts tailwind/eslint configs loaded via require().
 */
const { z } = require("zod");

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
});

/**
 * Validate public environment variables. Returns parsed env.
 * Safe to call in both apps during Phase 01; strictness can grow later.
 */
function validateEnv(env = process.env) {
  return envSchema.parse(env);
}

module.exports = { envSchema, validateEnv };
