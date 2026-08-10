// Internal className combiner for @doctor/ui — joins truthy segments.
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
