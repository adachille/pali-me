// Repository for deck CRUD operations and deck-item management

import type { SQLiteDatabase } from "expo-sqlite";
import { DEFAULT_DECK_ID } from "../schema";
import type { Deck, DeckRow, DeckStudyDirection, Item, ItemRow } from "../types";
import { parseSqliteDate } from "../utils";

// ============================================================================
// Types
// ============================================================================

/**
 * Deck with computed item count
 */
export type DeckWithCount = Deck & { itemCount: number };

/**
 * Raw row from deck query with item count
 */
type DeckRowWithCount = DeckRow & { item_count: number; study_direction: string | null };

/**
 * Sort options for deck list
 */
export type SortOption =
  | "name_asc"
  | "name_desc"
  | "date_asc"
  | "date_desc"
  | "count_asc"
  | "count_desc";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parses study direction from database, defaulting to 'random'
 */
function parseStudyDirection(value: string | null): DeckStudyDirection {
  if (value === "pali_first" || value === "meaning_first" || value === "random") {
    return value;
  }
  return "random";
}

/**
 * Converts a raw database row to an application-level DeckWithCount
 */
function rowToDeckWithCount(row: DeckRowWithCount): DeckWithCount {
  return {
    id: row.id,
    name: row.name,
    createdAt: parseSqliteDate(row.created_at),
    studyDirection: parseStudyDirection(row.study_direction),
    itemCount: row.item_count,
  };
}

/**
 * Converts a raw database row to an application-level Deck
 */
function rowToDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    createdAt: parseSqliteDate(row.created_at),
    studyDirection: parseStudyDirection(row.study_direction),
  };
}

/**
 * Converts a raw database row to an application-level Item
 */
function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    type: row.type as Item["type"],
    pali: row.pali,
    meaning: row.meaning,
    notes: row.notes,
    createdAt: parseSqliteDate(row.created_at),
  };
}

/**
 * Gets the SQL ORDER BY clause for a sort option
 */
function getSortClause(sort: SortOption): string {
  switch (sort) {
    case "name_asc":
      return "d.name COLLATE NOCASE ASC";
    case "name_desc":
      return "d.name COLLATE NOCASE DESC";
    case "date_asc":
      return "d.created_at ASC";
    case "date_desc":
      return "d.created_at DESC";
    case "count_asc":
      return "item_count ASC, d.name COLLATE NOCASE ASC";
    case "count_desc":
      return "item_count DESC, d.name COLLATE NOCASE ASC";
  }
}

// ============================================================================
// Deck CRUD Operations
// ============================================================================

/**
 * Fetches all decks with item counts
 */
export async function getAll(
  db: SQLiteDatabase,
  sort: SortOption = "name_asc"
): Promise<DeckWithCount[]> {
  const sortClause = getSortClause(sort);
  const rows = await db.getAllAsync<DeckRowWithCount>(
    `SELECT d.*, COUNT(di.item_id) as item_count
     FROM decks d
     LEFT JOIN deck_items di ON d.id = di.deck_id
     GROUP BY d.id
     ORDER BY ${sortClause}`
  );
  return rows.map(rowToDeckWithCount);
}

/**
 * Fetches a single deck by ID with item count
 */
export async function getById(db: SQLiteDatabase, id: number): Promise<DeckWithCount | null> {
  const row = await db.getFirstAsync<DeckRowWithCount>(
    `SELECT d.*, COUNT(di.item_id) as item_count
     FROM decks d
     LEFT JOIN deck_items di ON d.id = di.deck_id
     WHERE d.id = ?
     GROUP BY d.id`,
    [id]
  );
  return row ? rowToDeckWithCount(row) : null;
}

/**
 * Searches decks by name (case-insensitive)
 */
export async function search(
  db: SQLiteDatabase,
  query: string,
  sort: SortOption = "name_asc"
): Promise<DeckWithCount[]> {
  const pattern = `%${query}%`;
  const sortClause = getSortClause(sort);
  const rows = await db.getAllAsync<DeckRowWithCount>(
    `SELECT d.*, COUNT(di.item_id) as item_count
     FROM decks d
     LEFT JOIN deck_items di ON d.id = di.deck_id
     WHERE d.name LIKE ? COLLATE NOCASE
     GROUP BY d.id
     ORDER BY ${sortClause}`,
    [pattern]
  );
  return rows.map(rowToDeckWithCount);
}

/**
 * Checks if a deck name already exists (case-insensitive)
 *
 * @param db - SQLite database instance
 * @param name - Deck name to check
 * @param excludeId - Optional deck ID to exclude (for update validation)
 * @returns true if name exists
 */
export async function nameExists(
  db: SQLiteDatabase,
  name: string,
  excludeId?: number
): Promise<boolean> {
  const query = excludeId
    ? "SELECT 1 FROM decks WHERE name = ? COLLATE NOCASE AND id != ? LIMIT 1"
    : "SELECT 1 FROM decks WHERE name = ? COLLATE NOCASE LIMIT 1";
  const params = excludeId ? [name, excludeId] : [name];
  const row = await db.getFirstAsync(query, params);
  return row !== null;
}

/**
 * Creates a new deck
 *
 * @param db - SQLite database instance
 * @param name - Deck name (must be unique, not empty, not "All")
 * @returns The created deck
 * @throws Error if validation fails
 */
export async function create(db: SQLiteDatabase, name: string): Promise<Deck> {
  // Validation
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Deck name cannot be empty");
  }
  if (trimmedName.toLowerCase() === "all") {
    throw new Error('Cannot use reserved name "All"');
  }
  if (await nameExists(db, trimmedName)) {
    throw new Error("A deck with this name already exists");
  }

  const result = await db.runAsync("INSERT INTO decks (name) VALUES (?)", [trimmedName]);

  const created = await db.getFirstAsync<DeckRow>("SELECT * FROM decks WHERE id = ?", [
    result.lastInsertRowId,
  ]);

  if (!created) {
    throw new Error("Failed to retrieve created deck");
  }

  return rowToDeck(created);
}

/**
 * Updates a deck's name
 *
 * @param db - SQLite database instance
 * @param id - Deck ID to update
 * @param name - New deck name
 * @returns The updated deck, or null if not found
 * @throws Error if validation fails
 */
export async function update(db: SQLiteDatabase, id: number, name: string): Promise<Deck | null> {
  // Cannot update the default deck name
  if (id === DEFAULT_DECK_ID) {
    throw new Error('Cannot rename the "All" deck');
  }

  // Validation
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Deck name cannot be empty");
  }
  if (trimmedName.toLowerCase() === "all") {
    throw new Error('Cannot use reserved name "All"');
  }
  if (await nameExists(db, trimmedName, id)) {
    throw new Error("A deck with this name already exists");
  }

  await db.runAsync("UPDATE decks SET name = ? WHERE id = ?", [trimmedName, id]);

  const updated = await db.getFirstAsync<DeckRow>("SELECT * FROM decks WHERE id = ?", [id]);
  return updated ? rowToDeck(updated) : null;
}

/**
 * Deletes a deck by ID
 * The deck_items entries are automatically deleted via CASCADE
 * Items themselves remain in the database
 *
 * @param db - SQLite database instance
 * @param id - Deck ID to delete
 * @returns true if deleted, false if not found
 * @throws Error if attempting to delete the default deck
 */
export async function deleteDeck(db: SQLiteDatabase, id: number): Promise<boolean> {
  if (id === DEFAULT_DECK_ID) {
    throw new Error('Cannot delete the "All" deck');
  }

  const result = await db.runAsync("DELETE FROM decks WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Updates a deck's study direction preference
 *
 * @param db - SQLite database instance
 * @param id - Deck ID to update
 * @param direction - New study direction preference
 */
export async function updateStudyDirection(
  db: SQLiteDatabase,
  id: number,
  direction: DeckStudyDirection
): Promise<void> {
  await db.runAsync("UPDATE decks SET study_direction = ? WHERE id = ?", [direction, id]);
}

// ============================================================================
// Deck-Item Operations
// ============================================================================

/**
 * Gets all items in a specific deck
 */
export async function getItemsInDeck(db: SQLiteDatabase, deckId: number): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT i.* FROM items i
     INNER JOIN deck_items di ON i.id = di.item_id
     WHERE di.deck_id = ?
     ORDER BY i.pali COLLATE NOCASE`,
    [deckId]
  );
  return rows.map(rowToItem);
}

/**
 * Gets all items NOT in a specific deck (for add items modal)
 */
export async function getItemsNotInDeck(db: SQLiteDatabase, deckId: number): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT * FROM items
     WHERE id NOT IN (
       SELECT item_id FROM deck_items WHERE deck_id = ?
     )
     ORDER BY pali COLLATE NOCASE`,
    [deckId]
  );
  return rows.map(rowToItem);
}

/**
 * Adds multiple items to a deck
 *
 * @param db - SQLite database instance
 * @param deckId - Deck ID
 * @param itemIds - Array of item IDs to add
 */
export async function addItemsToDeck(
  db: SQLiteDatabase,
  deckId: number,
  itemIds: number[]
): Promise<void> {
  if (itemIds.length === 0) return;

  await db.withTransactionAsync(async () => {
    for (const itemId of itemIds) {
      await db.runAsync("INSERT OR IGNORE INTO deck_items (deck_id, item_id) VALUES (?, ?)", [
        deckId,
        itemId,
      ]);
    }
  });
}

/**
 * Removes a single item from a deck
 *
 * @param db - SQLite database instance
 * @param deckId - Deck ID
 * @param itemId - Item ID to remove
 * @returns true if removed, false if not found
 * @throws Error if attempting to remove from the "All" deck
 */
export async function removeItemFromDeck(
  db: SQLiteDatabase,
  deckId: number,
  itemId: number
): Promise<boolean> {
  if (deckId === DEFAULT_DECK_ID) {
    throw new Error('Cannot remove items from the "All" deck');
  }

  const result = await db.runAsync("DELETE FROM deck_items WHERE deck_id = ? AND item_id = ?", [
    deckId,
    itemId,
  ]);
  return result.changes > 0;
}
