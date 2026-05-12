export const LINK_TITLE_FALLBACK = "Title not available";
export const FETCHED_LINK_TITLES_STORAGE_KEY = "fetchedLinkTitlesByUrl";

function sanitizeLinkTitle(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLinkStorageKey(rawUrl = "") {
  if (typeof rawUrl !== "string") return "";
  return rawUrl.trim().toLowerCase().replace(/\/+$/, "");
}

function readStoredLinkTitles() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FETCHED_LINK_TITLES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveFetchedTitleToLocalStorage(url, title) {
  if (typeof window === "undefined") return;
  const key = normalizeLinkStorageKey(url);
  const cleanTitle = sanitizeLinkTitle(title);
  if (!key || !cleanTitle || cleanTitle === LINK_TITLE_FALLBACK) return;
  try {
    const current = readStoredLinkTitles();
    if (current[key] === cleanTitle) return;
    localStorage.setItem(
      FETCHED_LINK_TITLES_STORAGE_KEY,
      JSON.stringify({
        ...current,
        [key]: cleanTitle,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
}

export function getFetchedTitleFromLocalStorage(url) {
  const key = normalizeLinkStorageKey(url);
  if (!key) return "";
  const current = readStoredLinkTitles();
  return sanitizeLinkTitle(current[key] || "");
}

export function clearFetchedTitlesFromLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FETCHED_LINK_TITLES_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

/**
 * Title from /api/fetch-page-title JSON (and similar). Ignores generic fallback strings.
 */
export function extractFetchedPageTitleFromJson(payload) {
  if (!payload || typeof payload !== "object") return "";
  const t = sanitizeLinkTitle(
    payload.title ??
      payload.page_title ??
      payload.webpage_title ??
      payload.meta_title ??
      payload.html_title ??
      payload.document_title ??
      payload.head_title ??
      "",
  );
  if (!t || t === LINK_TITLE_FALLBACK) return "";
  return t;
}

/**
 * Best-effort title from API records (source materials, link upload responses).
 */
export function extractLinkTitleFromRecord(payload) {
  if (!payload || typeof payload !== "object") return "";
  const raw = Array.isArray(payload) ? payload[0] : payload;
  if (!raw || typeof raw !== "object") return "";
  const meta =
    raw.metadata && typeof raw.metadata === "object" ? raw.metadata : null;
  const candidates = [
    raw.title,
    raw.page_title,
    raw.webpage_title,
    raw.meta_title,
    raw.html_title,
    raw.document_title,
    raw.head_title,
    raw.og_title,
    raw.ogTitle,
    raw.link_title,
    raw.site_name,
    raw.source_name,
    raw.name,
    meta?.title,
    meta?.page_title,
    meta?.og_title,
  ]
    .map((v) => sanitizeLinkTitle(v ?? ""))
    .filter(Boolean);
  if (candidates.length === 0) return "";
  return candidates.reduce(
    (best, cur) => (cur.length > best.length ? cur : best),
    candidates[0],
  );
}

export function deriveTitleFromUrl(rawUrl = "") {
  try {
    const parsed = new URL(rawUrl);

    const skipSegments = new Set([
      "wiki",
      "w",
      "en",
      "article",
      "page",
      "index",
    ]);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const candidate = [...pathParts].reverse().find((part) => {
      const decoded = decodeURIComponent(part);
      return (
        decoded.length > 3 &&
        !skipSegments.has(decoded.toLowerCase()) &&
        !/^[0-9a-f-]{8,}$/i.test(decoded)
      );
    });
    if (candidate) {
      const decoded = decodeURIComponent(candidate)
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]/g, " ")
        .trim();
      if (decoded.length > 3) {
        return decoded.charAt(0).toUpperCase() + decoded.slice(1);
      }
    }

    const host = parsed.hostname.replace(/^www\./i, "");
    const labels = host.split(".");
    const label = (
      labels.length >= 2 ? labels[labels.length - 2] : labels[0] || ""
    ).trim();
    if (!label) return LINK_TITLE_FALLBACK;
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return LINK_TITLE_FALLBACK;
  }
}
