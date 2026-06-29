export const PATH_EMAIL_DYNAMIC_TAGS = [
  "@user_name",
  "@cycle_name",
  "@first_name",
  "@leaderboard",
  "@user_activity",
];

export function filterDynamicTags(query) {
  const q = (query || "").toLowerCase();
  if (!q) return [...PATH_EMAIL_DYNAMIC_TAGS];
  return PATH_EMAIL_DYNAMIC_TAGS.filter((tag) => {
    const name = tag.slice(1).toLowerCase();
    return name.startsWith(q) || tag.toLowerCase().includes(q);
  });
}

/** @returns {{ query: string, atIndex: number, replaceLength: number } | null} */
export function matchDynamicTagAtCursor(textBeforeCursor, cursorIndex) {
  if (typeof textBeforeCursor !== "string") return null;
  const match = textBeforeCursor.match(/@([a-zA-Z_]*)$/);
  if (!match) return null;
  const query = match[1];
  const token = `@${query}`;
  if (PATH_EMAIL_DYNAMIC_TAGS.includes(token)) return null;
  const atIndex = cursorIndex - query.length - 1;
  return {
    query,
    atIndex,
    replaceLength: query.length + 1,
  };
}
