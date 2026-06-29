/** [ISO-style code, display label] pairs for language selection. */
export const LANGUAGES = [
  ["af", "Afrikaans"],
  ["sq", "Albanian"],
  ["am", "Amharic"],
  ["ar", "Arabic"],
  ["hy", "Armenian"],
  ["az", "Azeerbaijani"],
  ["eu", "Basque"],
  ["be", "Belarusian"],
  ["bn", "Bengali"],
  ["bs", "Bosnian"],
  ["bg", "Bulgarian"],
  ["ca", "Catalan"],
  ["ceb", "Cebuano"],
  ["zh-CN", "Chinese (Simplified)"],
  ["zh-TW", "Chinese (Traditional)"],
  ["co", "Corsican"],
  ["hr", "Croatian"],
  ["cs", "Czech"],
  ["da", "Danish"],
  ["nl", "Dutch"],
  ["en", "English"],
  ["eo", "Esperanto"],
  ["et", "Estonian"],
  ["fi", "Finnish"],
  ["fr", "French"],
  ["fy", "Frisian"],
  ["gl", "Galician"],
  ["ka", "Georgian"],
  ["de", "German"],
  ["el", "Greek"],
  ["gu", "Gujarati"],
  ["ht", "Haitian Creole"],
  ["ha", "Hausa"],
  ["haw", "Hawaiian"],
  ["he", "Hebrew"],
  ["hi", "Hindi"],
  ["hmn", "Hmong"],
  ["hu", "Hungarian"],
  ["is", "Icelandic"],
  ["ig", "Igbo"],
  ["id", "Indonesian"],
  ["ga", "Irish"],
  ["it", "Italian"],
  ["ja", "Japanese"],
  ["jw", "Javanese"],
  ["kn", "Kannada"],
  ["kk", "Kazakh"],
  ["km", "Khmer"],
  ["ko", "Korean"],
  ["ku", "Kurdish"],
  ["ky", "Kyrgyz"],
  ["lo", "Lao"],
  ["la", "Latin"],
  ["lv", "Latvian"],
  ["lt", "Lithuanian"],
  ["lb", "Luxembourgish"],
  ["mk", "Macedonian"],
  ["mg", "Malagasy"],
  ["ms", "Malay"],
  ["ml", "Malayalam"],
  ["mt", "Maltese"],
  ["mi", "Maori"],
  ["mr", "Marathi"],
  ["mn", "Mongolian"],
  ["my", "Myanmar (Burmese)"],
  ["ne", "Nepali"],
  ["no", "Norwegian"],
  ["ny", "Nyanja (Chichewa)"],
  ["ps", "Pashto"],
  ["fa", "Persian"],
  ["pl", "Polish"],
  ["pt", "Portuguese (Portugal, Brazil)"],
  ["pa", "Punjabi"],
  ["ro", "Romanian"],
  ["ru", "Russian"],
  ["sm", "Samoan"],
  ["gd", "Scots Gaelic"],
  ["sr", "Serbian"],
  ["st", "Sesotho"],
  ["sn", "Shona"],
  ["sd", "Sindhi"],
  ["si", "Sinhala (Sinhalese)"],
  ["sk", "Slovak"],
  ["sl", "Slovenian"],
  ["so", "Somali"],
  ["es", "Spanish"],
  ["su", "Sundanese"],
  ["sw", "Swahili"],
  ["sv", "Swedish"],
  ["tl", "Tagalog (Filipino)"],
  ["tg", "Tajik"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["th", "Thai"],
  ["tr", "Turkish"],
  ["uk", "Ukrainian"],
  ["ur", "Urdu"],
  ["uz", "Uzbek"],
  ["vi", "Vietnamese"],
  ["cy", "Welsh"],
  ["xh", "Xhosa"],
  ["yi", "Yiddish"],
  ["yo", "Yoruba"],
  ["zu", "Zulu"],
  ["rw", "Kinyarwanda"],
];

const LANGUAGE_LOOKUP = LANGUAGES.reduce((acc, [code, label]) => {
  acc[code.toLowerCase()] = code;
  acc[label.toLowerCase()] = code;
  return acc;
}, {});

/** Legacy full-name values previously stored by the API. */
const LEGACY_LANGUAGE_MAP = {
  english: "en",
  spanish: "es",
  french: "fr",
};

/**
 * Normalize a language value from the API to a valid language code.
 * @param {string} apiValue - Raw value (e.g. from enabled_attributes.language)
 * @returns {string} Valid language code, defaults to "en"
 */
export function normalizeLanguageFromApi(apiValue) {
  if (apiValue == null || typeof apiValue !== "string") return "en";
  const trimmed = String(apiValue).trim();
  if (!trimmed) return "en";
  const lower = trimmed.toLowerCase();
  return LANGUAGE_LOOKUP[lower] || LEGACY_LANGUAGE_MAP[lower] || "en";
}
