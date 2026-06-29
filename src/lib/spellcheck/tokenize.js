const WORD_REGEX = /[a-zA-Z]+(?:'[a-zA-Z]+)*(?:-[a-zA-Z]+(?:'[a-zA-Z]+)*)*/g;

export function tokenizeWords(text) {
  if (typeof text !== "string" || text.length === 0) {
    return [];
  }

  const words = [];
  let match = WORD_REGEX.exec(text);

  while (match) {
    words.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = WORD_REGEX.exec(text);
  }

  WORD_REGEX.lastIndex = 0;
  return words;
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildMisspelledMarkup(text, misspelledRanges) {
  if (!text) {
    return "&nbsp;";
  }

  const sorted = [...misspelledRanges].sort((a, b) => a.start - b.start);
  let html = "";
  let lastIndex = 0;

  sorted.forEach(({ start, end }) => {
    if (start < lastIndex) {
      return;
    }

    html += escapeHtml(text.slice(lastIndex, start));
    html += `<span class="kyper-spell-error">${escapeHtml(text.slice(start, end))}</span>`;
    lastIndex = end;
  });

  html += escapeHtml(text.slice(lastIndex));

  return html || "&nbsp;";
}

/**
 * Quill stores each line as a <p> block; mirroring that layout keeps underline
 * positions aligned with the visible editor text (flat pre-wrap drifts).
 */
export function buildQuillMisspelledMarkup(text, misspelledRanges) {
  if (!text) {
    return "<p><br></p>";
  }

  const lines = text.split("\n");
  let offset = 0;

  const html = lines
    .map((line) => {
      const lineRanges = misspelledRanges
        .filter(({ start, end }) => end > offset && start < offset + line.length)
        .map(({ start, end }) => ({
          start: Math.max(0, start - offset),
          end: Math.min(line.length, end - offset),
        }))
        .filter(({ start, end }) => end > start);

      const inner = line.length
        ? buildMisspelledMarkup(line, lineRanges)
        : "<br>";
      offset += line.length + 1;
      return `<p>${inner}</p>`;
    })
    .join("");

  return html || "<p><br></p>";
}
