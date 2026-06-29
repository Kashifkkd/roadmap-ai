/** Product and L&D terms valid in Kyper Studio but missing from the base EN dictionary. */
export const CUSTOM_DICTIONARY_WORDS = [
  "microlearning",
  "micro-learning",
  "microlearning's",
  "elearning",
  "e-learning",
  "onboarding",
  "upskilling",
  "reskilling",
  "behaviour",
  "behaviours",
  "behavioural",
  "learner",
  "learners",
  "kyper",
  "comet",
  "comets",
  "gamification",
  "workflow",
  "workflows",
  "upsell",
  "enablement",
];

const sessionIgnoredWords = new Set();

export function ignoreWordForSession(word) {
  if (!word) return;
  sessionIgnoredWords.add(word.toLowerCase());
}

export function isSessionIgnoredWord(word) {
  if (!word) return false;
  return sessionIgnoredWords.has(word.toLowerCase());
}

export function getSessionIgnoredWords() {
  return sessionIgnoredWords;
}

export function registerCustomWords(checker) {
  if (!checker?.add) return;

  CUSTOM_DICTIONARY_WORDS.forEach((word) => {
    try {
      checker.add(word);
    } catch {
      /* already added */
    }
  });

  sessionIgnoredWords.forEach((word) => {
    try {
      checker.add(word);
    } catch {
      /* already added */
    }
  });
}

export function getCompoundFallbackSuggestions(word) {
  if (!word || word.length < 6) {
    return [];
  }

  const lower = word.toLowerCase();
  const prefixes = ["micro", "e", "re", "un", "pre", "multi", "non", "co", "de"];
  const suggestions = [];

  prefixes.forEach((prefix) => {
    if (lower.startsWith(prefix) && lower.length > prefix.length + 2) {
      const rest = word.slice(prefix.length);
      suggestions.push(`${prefix} ${rest}`);
      suggestions.push(`${prefix}-${rest}`);
    }
  });

  return [...new Set(suggestions)];
}
