// Export repository for database backup/export functionality

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { SQLiteDatabase } from "expo-sqlite";

import { SCHEMA_VERSION } from "../schema";
import type { DeckItemRow, DeckRow, ItemRow, StudyStateRow } from "../types";

/**
 * Structure of the exported JSON data
 */
export type ExportData = {
  exportedAt: string;
  schemaVersion: number;
  data: {
    items: ItemRow[];
    studyStates: StudyStateRow[];
    decks: DeckRow[];
    deckItems: DeckItemRow[];
  };
};

/**
 * Exports all database data as a JSON file and opens the share dialog
 *
 * @param db - The SQLite database instance
 * @returns The file path of the exported JSON file
 */
export async function exportDatabaseAsJson(db: SQLiteDatabase): Promise<string> {
  // Query all tables
  const items = await db.getAllAsync<ItemRow>("SELECT * FROM items");
  const studyStates = await db.getAllAsync<StudyStateRow>("SELECT * FROM study_states");
  const decks = await db.getAllAsync<DeckRow>("SELECT * FROM decks");
  const deckItems = await db.getAllAsync<DeckItemRow>("SELECT * FROM deck_items");

  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    data: {
      items,
      studyStates,
      decks,
      deckItems,
    },
  };

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pali-me-export-${timestamp}.json`;
  const filepath = FileSystem.cacheDirectory + filename;

  // Write JSON to file
  await FileSystem.writeAsStringAsync(filepath, JSON.stringify(exportData, null, 2));

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filepath, {
      mimeType: "application/json",
      dialogTitle: "Export Pali-Me Data",
    });
  }

  return filepath;
}
