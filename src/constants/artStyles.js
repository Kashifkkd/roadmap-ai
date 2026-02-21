/**
 * Central art style definitions for step/screen image generation.
 * Backend should use the same ART_STYLE_PROMPTS map.
 */

export const ART_STYLE_PROMPTS = {
  "Editorial Illustration":
    "Style: contemporary editorial illustration for a thoughtful business publication. " +
    "Slightly textured brush strokes or subtle grain. " +
    "Muted but warm color palette. " +
    "Minimalist composition with a strong focal point. " +
    "Expressive but restrained. Human, intelligent, and refined.",
  "Candid Photography":
    "Style: candid documentary-style photography from a working environment similar to the audience's. " +
    "Natural lighting, authentic human expressions, real environments. " +
    "No staged corporate poses. No exaggerated smiles or artificial perfection. " +
    "Avoid shallow depth-of-field bokeh glamour shots. " +
    "Prioritize authenticity over polish.",
  "Abstract Concept":
    "Style: a subtle visual metaphor expressed through a clean, modern, tactile composition. " +
    "Avoid literal clipart symbolism. Keep the metaphor elegant and understated. " +
    "The design should feel like a consulting firm's strategy deck cover, not a startup pitch template.",
  Watercolor:
    "Style: soft watercolor illustration with visible brush texture and paper grain. " +
    "Gentle washes of color with organic edges. Warm, natural tones. " +
    "Slightly loose and hand-painted feel.",
  "Line Art":
    "Style: clean line drawing with minimal shading and confident strokes. " +
    "Black or dark ink on a light background. " +
    "Elegant simplicity—no fills, no gradients, just expressive lines.",
  "Flat Illustration":
    "Style: modern flat-design vector-style illustration. " +
    "Bold, harmonious color palette with clean shapes and no gradients or shadows. " +
    "Simple, geometric composition that feels contemporary and professional.",
  Custom: "", // User's image_guidance / prompt is the only style directive
};

/** Ordered list of art style labels for dropdowns. */
export const ART_STYLE_KEYS = Object.keys(ART_STYLE_PROMPTS);

/** Map from lowercase/slug API value to display label. Used to normalize art_style from API. */
const ART_STYLE_NORMALIZE_MAP = ART_STYLE_KEYS.reduce((acc, key) => {
  acc[key.toLowerCase().trim()] = key;
  return acc;
}, {});

/**
 * Normalize an art_style value from the API to a valid display key.
 * @param {string} apiValue - Raw value (e.g. from enabled_attributes.art_style)
 * @returns {string} Valid display key or empty string if unknown
 */
export function normalizeArtStyleFromApi(apiValue) {
  if (apiValue == null || typeof apiValue !== "string") return "";
  const trimmed = String(apiValue).trim();
  if (!trimmed) return "";
  const normalized = ART_STYLE_NORMALIZE_MAP[trimmed.toLowerCase()] || trimmed;
  return ART_STYLE_KEYS.includes(normalized) ? normalized : "";
}
