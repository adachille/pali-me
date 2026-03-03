/**
 * Normalizes a string for sorting by removing diacritics.
 * This ensures that characters like ā, ī, ū are sorted alongside a, i, u.
 *
 * @param str - The string to normalize
 * @returns Normalized string with diacritics removed
 */
export function normalizeForSort(str: string): string {
  return str
    .normalize("NFD") // Decompose combined characters into base + diacritic
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
    .toLowerCase();
}

/**
 * Compares two strings with proper diacritic handling for Pali text.
 * Used for sorting Pali words alphabetically where ā should sort with a.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns Negative if a < b, positive if a > b, zero if equal
 */
export function comparePali(a: string, b: string): number {
  return normalizeForSort(a).localeCompare(normalizeForSort(b));
}
