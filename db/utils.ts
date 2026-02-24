/**
 * Parses a SQLite datetime string (UTC) into a JavaScript Date.
 * SQLite's datetime('now') returns UTC without a timezone indicator,
 * so we append 'Z' to ensure JavaScript parses it as UTC.
 */
export function parseSqliteDate(dateStr: string): Date {
  // SQLite datetime format: "YYYY-MM-DD HH:MM:SS"
  // Append 'Z' to indicate UTC timezone
  return new Date(dateStr.replace(" ", "T") + "Z");
}
