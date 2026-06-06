/** @type {WeakMap<HTMLElement, Array<{ word: string, start: number, end: number }>>} */
const fieldMisspelledWords = new WeakMap();

/** @type {Map<string, string[]>} */
const suggestionCache = new Map();

const FIELD_MISSPELLED_KEY = "__kyperMisspelledWords";

export function setFieldMisspelledWords(field, ranges) {
  if (!field) {
    return;
  }

  fieldMisspelledWords.set(field, ranges);
  field[FIELD_MISSPELLED_KEY] = ranges;
}

export function getFieldMisspelledWords(field) {
  if (!field) {
    return [];
  }

  return (
    fieldMisspelledWords.get(field) ?? field[FIELD_MISSPELLED_KEY] ?? []
  );
}

export function findMisspelledWordAtIndex(field, index) {
  const ranges = getFieldMisspelledWords(field);
  if (!ranges.length || index == null || index < 0) {
    return null;
  }

  return (
    ranges.find(({ start, end }) => index >= start && index <= end) ??
    ranges.find(({ start, end }) => index > start && index < end) ??
    null
  );
}

export function findMisspelledWordForWordInfo(field, wordInfo) {
  const ranges = getFieldMisspelledWords(field);
  if (!wordInfo || !ranges.length) {
    return null;
  }

  if (ranges.length === 1) {
    return ranges[0];
  }

  return (
    ranges.find(
      ({ start, end, word }) =>
        start === wordInfo.start &&
        end === wordInfo.end &&
        word === wordInfo.word
    ) ??
    ranges.find(
      ({ start, end }) =>
        wordInfo.start >= start &&
        wordInfo.end <= end
    ) ??
    ranges.find(({ word }) => word.toLowerCase() === wordInfo.word.toLowerCase()) ??
    findClosestMisspelledWord(field, wordInfo.start ?? 0)
  );
}

export function findClosestMisspelledWord(field, index, maxDistance = 2) {
  const ranges = getFieldMisspelledWords(field);
  if (!ranges.length || index == null || index < 0) {
    return null;
  }

  let closest = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  ranges.forEach((range) => {
    let distance = 0;
    if (index < range.start) {
      distance = range.start - index;
    } else if (index > range.end) {
      distance = index - range.end;
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = range;
    }
  });

  if (maxDistance === Number.POSITIVE_INFINITY) {
    return closest;
  }

  return closestDistance <= maxDistance ? closest : null;
}

export function cacheSuggestions(word, suggestions) {
  if (!word) {
    return;
  }

  suggestionCache.set(word.toLowerCase(), suggestions);
}

export function getCachedSuggestions(word) {
  if (!word) {
    return null;
  }

  return suggestionCache.get(word.toLowerCase()) ?? null;
}

export function resolveSpellcheckTarget(node) {
  if (!node) {
    return null;
  }

  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    return node;
  }

  if (node.isContentEditable) {
    return node;
  }

  const field = node.closest?.(
    ".spellcheck-field input, .spellcheck-field textarea, input, textarea, [contenteditable='true'], .ql-editor"
  );

  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field?.isContentEditable
  ) {
    return field;
  }

  return null;
}

export function fieldHasMisspelledWords(field) {
  return getFieldMisspelledWords(field).length > 0;
}
