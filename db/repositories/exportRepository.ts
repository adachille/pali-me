// Export/Import repository for database backup functionality

import { Platform } from "react-native";
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
 * Result of import operation
 */
export type ImportResult = {
  itemsImported: number;
  studyStatesImported: number;
  decksImported: number;
  deckItemsImported: number;
};

function buildExportData(
  items: ItemRow[],
  studyStates: StudyStateRow[],
  decks: DeckRow[],
  deckItems: DeckItemRow[]
): ExportData {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    data: { items, studyStates, decks, deckItems },
  };
}

async function queryAllTables(db: SQLiteDatabase) {
  const items = await db.getAllAsync<ItemRow>("SELECT * FROM items");
  const studyStates = await db.getAllAsync<StudyStateRow>("SELECT * FROM study_states");
  const decks = await db.getAllAsync<DeckRow>("SELECT * FROM decks");
  const deckItems = await db.getAllAsync<DeckItemRow>("SELECT * FROM deck_items");
  return { items, studyStates, decks, deckItems };
}

async function importDataIntoDb(db: SQLiteDatabase, exportData: ExportData): Promise<ImportResult> {
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

  for (const item of exportData.data.items) {
    await db.runAsync(
      `INSERT INTO items (id, type, pali, meaning, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.id, item.type, item.pali, item.meaning, item.notes, item.created_at]
    );
  }

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

  for (const deck of exportData.data.decks) {
    if (deck.id === 1) continue;
    await db.runAsync(
      `INSERT INTO decks (id, name, created_at)
       VALUES (?, ?, ?)`,
      [deck.id, deck.name, deck.created_at]
    );
  }

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

// --- Web implementations ---

function exportWeb(jsonString: string) {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `pocket-pali-export-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function pickFileWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    let resolved = false;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = () => {
      resolved = true;
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    // Handle cancel: browsers don't fire "change" on cancel, so detect
    // when focus returns to the window without a file being selected.
    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      setTimeout(() => {
        if (!resolved) {
          resolve(null);
        }
      }, 300);
    };
    window.addEventListener("focus", onFocus);
    input.click();
  });
}

// --- Native implementations ---

async function exportNative(jsonString: string) {
  const FileSystem = await import("expo-file-system/legacy");
  const Sharing = await import("expo-sharing");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `pocket-pali-export-${timestamp}.json`;
  const filepath = FileSystem.cacheDirectory + filename;

  await FileSystem.writeAsStringAsync(filepath, jsonString);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filepath, {
      mimeType: "application/json",
      dialogTitle: "Export Pocket Pali Data",
    });
  }
}

async function pickFileNative(): Promise<string | null> {
  const DocumentPicker = await import("expo-document-picker");
  const FileSystem = await import("expo-file-system/legacy");

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  return FileSystem.readAsStringAsync(result.assets[0].uri);
}

// --- Public API ---

export async function exportDatabaseAsJson(db: SQLiteDatabase): Promise<string> {
  const { items, studyStates, decks, deckItems } = await queryAllTables(db);
  const exportData = buildExportData(items, studyStates, decks, deckItems);
  const jsonString = JSON.stringify(exportData, null, 2);

  if (Platform.OS === "web") {
    exportWeb(jsonString);
  } else {
    await exportNative(jsonString);
  }

  return jsonString;
}

export async function importDatabaseFromJson(db: SQLiteDatabase): Promise<ImportResult | null> {
  let jsonString: string | null;

  if (Platform.OS === "web") {
    jsonString = await pickFileWeb();
  } else {
    jsonString = await pickFileNative();
  }

  if (!jsonString) return null;

  const exportData: ExportData = JSON.parse(jsonString);
  return importDataIntoDb(db, exportData);
}
