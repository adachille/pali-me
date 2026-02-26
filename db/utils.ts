import type { DeckStudyDirection } from "./types";

/**
 * Parses a SQLite datetime string (UTC) into a JavaScript Date.
 * SQLite's datetime('now') returns UTC without a timezone indicator,
 * so we append 'Z' to ensure JavaScript parses it as UTC.
 *
 * Also handles ISO-8601 strings that already have timezone info
 * (e.g., from imported data or tests) to avoid double-appending 'Z'.
 */
export function parseSqliteDate(dateStr: string): Date {
  const trimmed = dateStr.trim();

  // If the string already includes a timezone (e.g., "2024-01-01T00:00:00.000Z" or "+01:00"),
  // pass it through to Date unchanged to avoid corrupting the timestamp (e.g., "...ZZ").
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
  if (hasTimezone) {
    return new Date(trimmed);
  }

  // SQLite datetime format: "YYYY-MM-DD HH:MM:SS" optionally with fractional seconds.
  // Append 'Z' to indicate UTC timezone
  return new Date(trimmed.replace(" ", "T") + "Z");
}

/**
 * Parses study direction from database, defaulting to 'random'
 */
export function parseStudyDirection(value: string | null): DeckStudyDirection {
  if (value === "pali_first" || value === "meaning_first" || value === "random") {
    return value;
  }
  return "random";
}
