/**
 * Accept common word forms the bundled Hunspell dictionary often omits:
 * abbreviations, closed compounds, agent-noun suffixes, plurals, -ity
 * derivatives, and hyphen variants of known words.
 */

const COMPOUND_FALSE_POSITIVE_PREFIXES = new Set([
  "the",
  "and",
  "for",
  "but",
  "not",
  "are",
  "was",
  "has",
  "had",
  "her",
  "his",
  "our",
  "out",
  "all",
  "any",
  "can",
  "may",
  "how",
  "why",
  "who",
  "you",
  "she",
  "him",
  "its",
  "did",
  "get",
  "got",
  "let",
  "say",
  "too",
  "use",
  "one",
  "two",
  "new",
  "old",
]);
export function isLikelyAbbreviation(word) {
  if (!word || word.length < 2) {
    return false;
  }

  const body = word.endsWith("'s") ? word.slice(0, -2) : word;
  if (body.length < 2) {
    return false;
  }

  // Plural acronyms: KPIs, OKRs, SOPs
  if (/^[A-Z]{2,}s$/.test(body)) {
    return true;
  }

  // Short all-caps forms and alphanumeric codes: IMD, CRM, B2B, 3D
  if (/^[A-Z0-9]{2,}$/.test(body) && /[A-Z]/.test(body)) {
    return true;
  }

  // Common lowercase shorthands without vowels: ffs, bpm, crm, vs
  if (
    body === body.toLowerCase() &&
    body.length <= 5 &&
    !/[aeiouy]/i.test(body)
  ) {
    return true;
  }

  return false;
}

export function isDictionaryMatch(checker, word) {
  if (!word || !checker?.correct) {
    return false;
  }

  if (checker.correct(word)) {
    return true;
  }

  const lower = word.toLowerCase();
  return lower !== word && checker.correct(lower);
}

export function isAcceptedWordForm(checker, word) {
  if (!word || !/[a-zA-Z]/.test(word)) {
    return true;
  }

  if (isDictionaryMatch(checker, word)) {
    return true;
  }

  if (isLikelyAbbreviation(word)) {
    return true;
  }

  if (isAcceptedClosedCompound(checker, word)) {
    return true;
  }

  if (isAcceptedAgentNounForm(checker, word)) {
    return true;
  }

  if (isAcceptedHyphenForm(checker, word)) {
    return true;
  }

  if (isAcceptedPluralForm(checker, word)) {
    return true;
  }

  if (isAcceptedDerivedForm(checker, word)) {
    return true;
  }

  return false;
}

function isAcceptedClosedCompound(checker, word) {
  if (!word || word.length < 6) {
    return false;
  }

  for (let i = 3; i <= word.length - 3; i += 1) {
    const left = word.slice(0, i);
    const right = word.slice(i);

    if (COMPOUND_FALSE_POSITIVE_PREFIXES.has(left.toLowerCase())) {
      continue;
    }

    if (isDictionaryMatch(checker, left) && isDictionaryMatch(checker, right)) {
      return true;
    }
  }

  return false;
}

function isAcceptedAgentNounForm(checker, word) {
  // Keep this conservative (length >= 7) so short typos like "techer" are not accepted.
  if (!word || word.length < 7) {
    return false;
  }

  for (const suffix of ["er", "or"]) {
    if (!word.endsWith(suffix)) {
      continue;
    }

    const stem = word.slice(0, -suffix.length);
    if (stem.length < 3 || !isDictionaryMatch(checker, stem)) {
      continue;
    }

    if (word.toLowerCase() === `${stem.toLowerCase()}${suffix}`) {
      return true;
    }
  }

  return false;
}

function isAcceptedHyphenForm(checker, word) {
  if (!word.includes("-")) {
    return false;
  }

  const parts = word.split("-").filter(Boolean);
  if (parts.length > 1 && parts.every((part) => isDictionaryMatch(checker, part))) {
    return true;
  }

  const withoutHyphens = word.replace(/-/g, "");
  return withoutHyphens !== word && isDictionaryMatch(checker, withoutHyphens);
}

function isAcceptedPluralForm(checker, word) {
  if (word.length <= 4) {
    return false;
  }

  if (word.endsWith("ies") && word.length > 5) {
    const singular = `${word.slice(0, -3)}y`;
    if (isDictionaryMatch(checker, singular)) {
      return true;
    }
  }

  if (word.endsWith("es") && word.length > 5) {
    const stem = word.slice(0, -2);
    if (isDictionaryMatch(checker, stem)) {
      return true;
    }
  }

  if (word.endsWith("s") && !word.endsWith("ss")) {
    const singular = word.slice(0, -1);
    if (singular.length >= 3 && isDictionaryMatch(checker, singular)) {
      // Stems that normally take -es should not pass with a bare -s typo.
      if (/(?:s|x|z|ch|sh)$/i.test(singular)) {
        return false;
      }
      return true;
    }
  }

  return false;
}

function isAcceptedDerivedForm(checker, word) {
  if (word.length <= 5 || !word.endsWith("ity")) {
    return false;
  }

  const stem = word.slice(0, -3);
  return isDictionaryMatch(checker, stem);
}
