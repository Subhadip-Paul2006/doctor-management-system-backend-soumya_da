// Minimal className combiner — joins truthy string segments with a space.
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
