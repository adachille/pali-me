// Export/Import repository for database backup functionality

import * as DocumentPicker from "expo-document-picker";
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

/**
 * Result of import operation
 */
export type ImportResult = {
  itemsImported: number;
  studyStatesImported: number;
  decksImported: number;
  deckItemsImported: number;
};

/**
 * Opens a file picker for the user to select a JSON export file,
 * then imports the data into the database.
 *
 * @param db - The SQLite database instance
 * @returns Import statistics or null if cancelled
 */
export async function importDatabaseFromJson(db: SQLiteDatabase): Promise<ImportResult | null> {
  // Open file picker
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const fileUri = result.assets[0].uri;

  // Read and parse JSON
  const jsonString = await FileSystem.readAsStringAsync(fileUri);
  const exportData: ExportData = JSON.parse(jsonString);

  // Validate schema version
  if (exportData.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      `Import file has schema version ${exportData.schemaVersion}, but this app only supports version ${SCHEMA_VERSION}. Please update the app.`
    );
  }

  // Clear existing data (in reverse dependency order)
  await db.runAsync("DELETE FROM deck_items");
  await db.runAsync("DELETE FROM study_states");
  await db.runAsync("DELETE FROM decks WHERE id != 1"); // Keep default "All" deck
  await db.runAsync("DELETE FROM items");

  // Import items
  for (const item of exportData.data.items) {
    await db.runAsync(
      `INSERT INTO items (id, type, pali, meaning, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.type, item.pali, item.meaning, item.notes, item.created_at]
    );
  }

  // Import study states
  for (const state of exportData.data.studyStates) {
    await db.runAsync(
      `INSERT INTO study_states (id, item_id, direction, interval, ease, due, suspended)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        state.id,
        state.item_id,
        state.direction,
        state.interval,
        state.ease,
        state.due,
        state.suspended,
      ]
    );
  }

  // Import decks (skip id=1 which is the default "All" deck)
  for (const deck of exportData.data.decks) {
    if (deck.id === 1) continue;
    await db.runAsync(
      `INSERT INTO decks (id, name, created_at)
       VALUES (?, ?, ?)`,
      [deck.id, deck.name, deck.created_at]
    );
  }

  // Import deck items
  for (const deckItem of exportData.data.deckItems) {
    await db.runAsync(
      `INSERT INTO deck_items (deck_id, item_id)
       VALUES (?, ?)`,
      [deckItem.deck_id, deckItem.item_id]
    );
  }

  return {
    itemsImported: exportData.data.items.length,
    studyStatesImported: exportData.data.studyStates.length,
    decksImported: exportData.data.decks.filter((d) => d.id !== 1).length,
    deckItemsImported: exportData.data.deckItems.length,
  };
}
