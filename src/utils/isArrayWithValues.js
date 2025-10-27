/**
 * Checks if the provided value is an array with at least one element
 * @param {any} value - The value to check
 * @returns {boolean} - True if value is an array with values, false otherwise
 */
export function isArrayWithValues(value) {
  return Array.isArray(value) && value.length > 0;
}
