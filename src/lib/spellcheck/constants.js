export const SPELLCHECK_LANG = "en-US";

/** Bundled Hunspell en_US-large (SCOWL size 70) — official wordlist.aspell.net / en-wl release. */
export const SPELLCHECK_DICTIONARY_ID = "en_US-large";

export const SPELLCHECK_DICTIONARY_PATH = "/spellcheck/en-US";

/** Input types that should not receive spell checking. */
export const SPELLCHECK_EXCLUDED_INPUT_TYPES = new Set([
  "password",
  "email",
  "number",
  "tel",
  "url",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "color",
  "range",
  "file",
  "hidden",
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
]);

export const SPELLCHECK_APPLIED_ATTR = "data-kyper-spellcheck";

export const SPELLCHECK_SKIP_ATTR = "data-spellcheck";

/** Skip imperative overlay attach (avoids React DOM conflicts on native fields). */
export const SPELLCHECK_IMPERATIVE_SKIP_ATTR =
  "data-kyper-no-imperative-spellcheck";
