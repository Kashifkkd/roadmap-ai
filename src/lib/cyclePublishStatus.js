/**
 * Centralized utilities for detecting published vs unpublished entities
 * in a Kyper cycle's response_path.
 *
 * A "real" (published) ID is a positive integer — either a JS number or
 * a purely-numeric string like "42".  Placeholder IDs such as
 * "#chapter_12utq8u4t", null, undefined, or 0 are NOT real IDs.
 */

/**
 * @param {*} value
 * @returns {boolean} true when value is a positive integer DB ID
 */
export function isRealId(value) {
  if (value == null) return false;
  if (typeof value === "number") return Number.isInteger(value) && value > 0;
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    return !isNaN(n) && n > 0 && String(n) === value;
  }
  return false;
}

/**
 * Walk the response_path tree and return true if ANY entity
 * (path, chapter, step, or screen) has a non-integer / placeholder ID.
 *
 * @param {object | null | undefined} responsePath — sessionData.response_path
 * @returns {boolean}
 */
export function hasUnpublishedData(responsePath) {
  if (!responsePath) return true;
  if (!isRealId(responsePath.id)) return true;

  for (const chapter of responsePath.chapters || []) {
    if (!isRealId(chapter.id)) return true;
    for (const stepItem of chapter.steps || []) {
      const step = stepItem?.step || {};
      if (!isRealId(step.id)) return true;
      for (const screen of stepItem.screens || []) {
        if (typeof screen !== "object" || !screen) continue;
        if (!isRealId(screen.id)) return true;
      }
    }
  }
  return false;
}
