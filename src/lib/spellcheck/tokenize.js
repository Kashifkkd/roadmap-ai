const WORD_REGEX = /[a-zA-Z']+/g;

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
