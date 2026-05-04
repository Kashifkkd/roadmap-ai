/**
 * Parse response_path.all_kickoff_dates into UI rows { date, time } (HTML date/time strings).
 */
export function normalizeKickOffDatesFromSession(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (entry == null || typeof entry !== "object") return null;
        const date = entry.date ?? entry.Date ?? "";
        const time = entry.time ?? entry.Time ?? "";
        if (!String(date).trim() && !String(time).trim()) return null;
        return { date: String(date), time: String(time) };
      })
      .filter(Boolean);
  }
  if (typeof raw === "object") {
    return normalizeKickOffDatesFromSession(Object.values(raw));
  }
  return [];
}

/** Persisted shape for response_path.all_kickoff_dates; null clears / matches sample payloads. */
export function serializeKickOffDatesForResponsePath(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.map((r) => ({
    date: r?.date != null ? String(r.date) : "",
    time: r?.time != null ? String(r.time) : "",
  }));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Safe display for HTML date input value (YYYY-MM-DD). */
export function formatKickOffDateDisplay(dateStr) {
  if (dateStr == null || String(dateStr).trim() === "") return "—";
  const s = String(dateStr).trim();
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return s;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Safe display for HTML time value (HH:mm or HH:mm:ss). */
export function formatKickOffTimeDisplay(timeStr) {
  if (timeStr == null || String(timeStr).trim() === "") return "—";
  const parts = String(timeStr).trim().split(":");
  const hRaw = parts[0];
  const minutes = parts[1] ?? "00";
  const h = parseInt(hRaw, 10);
  if (Number.isNaN(h)) return String(timeStr);
  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${String(hour12).padStart(2, "0")}:${minutes.padStart(2, "0")} ${ampm}`;
}
