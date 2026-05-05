const urlKey = (url = "") => (url || "").trim().toLowerCase().replace(/\/+$/, "");

function entryUrl(e) {
  if (e == null) return "";
  if (typeof e === "string") return e.trim();
  return String(e.webpage_url ?? e.url ?? "").trim();
}

function entryTitle(e) {
  if (e == null || typeof e !== "object") return "";
  const t =
    e.title ??
    e.page_title ??
    e.webpage_title ??
    e.source_name ??
    e.meta_title ??
    "";
  return typeof t === "string" ? t.trim() : "";
}

/** Server sometimes echoes the raw URL as "title" — treat as missing. */
function hasRealTitle(title, url) {
  const t = (title || "").trim();
  const u = (url || "").trim();
  if (!t) return false;
  if (u && t === u) return false;
  return true;
}

/**
 * Preserve non-empty link titles from the previous session when the server
 * omits them on the next push (common for webpage_url).
 */
export function mergeWebpageUrlTitlesFromPreviousSession(
  incomingSession,
  previousSession,
) {
  if (!incomingSession || typeof incomingSession !== "object") {
    return incomingSession;
  }
  const incoming = incomingSession.webpage_url;
  const prev = previousSession?.webpage_url;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return incomingSession;
  }
  if (!Array.isArray(prev) || prev.length === 0) {
    return incomingSession;
  }

  const titleByKey = new Map();
  prev.forEach((entry) => {
    const u = entryUrl(entry);
    const key = urlKey(u);
    const title = entryTitle(entry);
    if (key && hasRealTitle(title, u)) titleByKey.set(key, title);
  });

  const merged = incoming.map((entry) => {
    if (typeof entry === "string") {
      const key = urlKey(entry);
      const recovered = key ? titleByKey.get(key) : "";
      if (recovered) {
        return { webpage_url: entry.trim(), title: recovered, comment: "" };
      }
      return { webpage_url: entry.trim(), title: "", comment: "" };
    }
    const u = entryUrl(entry);
    const key = urlKey(u);
    const rawTitle = entryTitle(entry);
    const hasTitle = hasRealTitle(rawTitle, u);
    const recovered = key ? titleByKey.get(key) : "";
    if (!hasTitle && recovered) {
      return { ...entry, title: recovered };
    }
    return entry;
  });

  return { ...incomingSession, webpage_url: merged };
}
