/**
 * User-facing label for a screen `contentType` or `screenType` id.
 * @param {string} [contentType]
 * @param {string} [emptyLabel] — when contentType is missing (default "Content"; use "unknown" for debug copy)
 */
export function formatContentTypeLabel(contentType, emptyLabel = "Content") {
  if (contentType == null || contentType === "") {
    return emptyLabel;
  }
  const raw = String(contentType);
  if (raw === "action" || raw === "actions") {
    return "Micro-action";
  }
  const words = raw
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ");
  return words
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(" ");
}
