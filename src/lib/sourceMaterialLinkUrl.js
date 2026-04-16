/**
 * Canonical public URL for a source material row of type "link".
 * The user-entered URL is returned as `output_presigned_url` (for links)
 * or `source_name`.
 */
export function resolveSourceMaterialLinkUrl(material) {
  if (!material) return "";
  const presigned = (material.output_presigned_url ?? "").trim();
  if (/^https?:\/\//i.test(presigned)) return presigned;
  const name = (material.source_name ?? "").trim();
  if (/^https?:\/\//i.test(name)) return name;
  return name || "";
}

/** True when the URL points at a PDF file (path or `format=pdf`). */
export function isDirectPdfUrl(url) {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    const pathAndQuery = `${u.pathname}${u.search}`.toLowerCase();
    if (/\.pdf($|[?#])/i.test(pathAndQuery)) return true;
    if (u.searchParams.get("format")?.toLowerCase() === "pdf") return true;
    return false;
  } catch {
    return /\.pdf($|[?#])/i.test(trimmed);
  }
}
