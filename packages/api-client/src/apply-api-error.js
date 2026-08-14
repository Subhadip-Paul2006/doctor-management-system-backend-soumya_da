// @doctor/api-client — map an ApiError onto form error state (Phase 09).
//
// The backend validation envelope is { success:false, message, errors:[{path,message}] }.
// `path` is usually the field name (string); Zod-style array paths are also
// tolerated (last segment wins). This turns that into a { field: message } map
// for field-level display, and surfaces the top-level message as a banner/toast.

export function extractFieldErrors(err) {
  const fieldErrors = {};
  const list = err && Array.isArray(err.errors) ? err.errors : [];
  for (const item of list) {
    if (!item) continue;
    let key = item.path;
    if (Array.isArray(key)) key = key[key.length - 1];
    if (key == null || key === "") continue;
    key = String(key);
    if (!(key in fieldErrors)) fieldErrors[key] = item.message || "Invalid value";
  }
  return fieldErrors;
}

/**
 * Apply an error to a form's setState setters.
 * @param err            the caught error (ideally an ApiError)
 * @param setFieldErrors (map) => void — replaces the field-error map
 * @param setServerError (msg) => void — shows a banner/toast message
 * Returns { fieldErrors, message } for callers that want the raw values.
 */
export function applyApiError(err, setFieldErrors, setServerError) {
  const fieldErrors = extractFieldErrors(err);
  const message = err && err.message ? err.message : "Something went wrong. Please try again.";
  if (typeof setFieldErrors === "function") setFieldErrors(fieldErrors);
  if (typeof setServerError === "function") setServerError(message);
  return { fieldErrors, message };
}
