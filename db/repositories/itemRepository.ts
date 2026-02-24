// Repository for item CRUD operations with automatic study state creation

import type { SQLiteDatabase } from "expo-sqlite";
import type { Item, ItemInsert, ItemRow, Deck, DeckRow, StudyDirection } from "../types";
import { DEFAULT_DECK_ID } from "../schema";
import { parseSqliteDate } from "../utils";

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
 * Converts a raw database row to an application-level Deck
 */
function rowToDeck(row: DeckRow): Deck {
  return {
    id: row.id,
    name: row.name,
    createdAt: parseSqliteDate(row.created_at),
  };
}

/**
 * Fetches all items ordered by pali text
 */
export async function getAll(db: SQLiteDatabase): Promise<Item[]> {
  const rows = await db.getAllAsync<ItemRow>("SELECT * FROM items ORDER BY pali COLLATE NOCASE");
  return rows.map(rowToItem);
}

/**
 * Fetches a single item by ID
 */
export async function getById(db: SQLiteDatabase, id: number): Promise<Item | null> {
  const row = await db.getFirstAsync<ItemRow>("SELECT * FROM items WHERE id = ?", [id]);
  return row ? rowToItem(row) : null;
}

/**
 * Searches items by pali text or meaning (case-insensitive)
 */
export async function search(db: SQLiteDatabase, query: string): Promise<Item[]> {
  const pattern = `%${query}%`;
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT * FROM items
     WHERE pali LIKE ? COLLATE NOCASE
        OR meaning LIKE ? COLLATE NOCASE
     ORDER BY pali COLLATE NOCASE`,
    [pattern, pattern]
  );
  return rows.map(rowToItem);
}

/**
 * Creates a new item with automatic study state creation and deck assignment
 *
 * @param db - SQLite database instance
 * @param item - The item data to insert
 * @param deckIds - Array of deck IDs to assign the item to (defaults to [DEFAULT_DECK_ID])
 * @returns The created item with its generated ID
 */
export async function create(
  db: SQLiteDatabase,
  item: ItemInsert,
  deckIds: number[] = [DEFAULT_DECK_ID]
): Promise<Item> {
  // Ensure we always include the default deck
  const allDeckIds = deckIds.includes(DEFAULT_DECK_ID) ? deckIds : [DEFAULT_DECK_ID, ...deckIds];

  let createdItemId: number;

  // Wrap all inserts in a transaction for atomicity
  await db.withTransactionAsync(async () => {
    // Insert the item
    const result = await db.runAsync(
      `INSERT INTO items (type, pali, meaning, notes) VALUES (?, ?, ?, ?)`,
      [item.type, item.pali, item.meaning, item.notes ?? null]
    );

    createdItemId = result.lastInsertRowId;

    // Create study states for both directions
    const directions: StudyDirection[] = ["pali_to_meaning", "meaning_to_pali"];
    for (const direction of directions) {
      await db.runAsync("INSERT INTO study_states (item_id, direction) VALUES (?, ?)", [
        createdItemId,
        direction,
      ]);
    }

    // Add item to decks
    for (const deckId of allDeckIds) {
      await db.runAsync("INSERT OR IGNORE INTO deck_items (deck_id, item_id) VALUES (?, ?)", [
        deckId,
        createdItemId,
      ]);
    }
  });

  // Fetch and return the created item
  const created = await getById(db, createdItemId!);
  if (!created) {
    throw new Error("Failed to retrieve created item");
  }
  return created;
}

/**
 * Updates an existing item's fields
 *
 * @param db - SQLite database instance
 * @param id - The item ID to update
 * @param item - The fields to update
 * @returns The updated item, or null if not found
 */
export async function update(
  db: SQLiteDatabase,
  id: number,
  item: Partial<ItemInsert>
): Promise<Item | null> {
  // Build dynamic update query based on provided fields
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (item.type !== undefined) {
    fields.push("type = ?");
    values.push(item.type);
  }
  if (item.pali !== undefined) {
    fields.push("pali = ?");
    values.push(item.pali);
  }
  if (item.meaning !== undefined) {
    fields.push("meaning = ?");
    values.push(item.meaning);
  }
  if (item.notes !== undefined) {
    fields.push("notes = ?");
    values.push(item.notes ?? null);
  }

  if (fields.length === 0) {
    // No fields to update, just return existing item
    return getById(db, id);
  }

  values.push(id);
  await db.runAsync(`UPDATE items SET ${fields.join(", ")} WHERE id = ?`, values);

  return getById(db, id);
}

/**
 * Deletes an item by ID
 * Study states and deck_items are automatically deleted via CASCADE
 *
 * @param db - SQLite database instance
 * @param id - The item ID to delete
 * @returns true if the item was deleted, false if not found
 */
export async function deleteItem(db: SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Gets all decks that an item belongs to
 */
export async function getDecksForItem(db: SQLiteDatabase, itemId: number): Promise<Deck[]> {
  const rows = await db.getAllAsync<DeckRow>(
    `SELECT d.* FROM decks d
     INNER JOIN deck_items di ON d.id = di.deck_id
     WHERE di.item_id = ?
     ORDER BY d.name COLLATE NOCASE`,
    [itemId]
  );
  return rows.map(rowToDeck);
}

/**
 * Gets all available decks (for picker)
 */
export async function getAllDecks(db: SQLiteDatabase): Promise<Deck[]> {
  const rows = await db.getAllAsync<DeckRow>("SELECT * FROM decks ORDER BY name COLLATE NOCASE");
  return rows.map(rowToDeck);
}

/**
 * Updates the deck assignments for an item
 *
 * @param db - SQLite database instance
 * @param itemId - The item ID
 * @param deckIds - The new set of deck IDs (always includes DEFAULT_DECK_ID)
 */
export async function updateItemDecks(
  db: SQLiteDatabase,
  itemId: number,
  deckIds: number[]
): Promise<void> {
  // Ensure we always include the default deck
  const allDeckIds = deckIds.includes(DEFAULT_DECK_ID) ? deckIds : [DEFAULT_DECK_ID, ...deckIds];

  // Wrap in transaction for atomicity
  await db.withTransactionAsync(async () => {
    // Remove existing deck assignments
    await db.runAsync("DELETE FROM deck_items WHERE item_id = ?", [itemId]);

    // Add new deck assignments
    for (const deckId of allDeckIds) {
      await db.runAsync("INSERT INTO deck_items (deck_id, item_id) VALUES (?, ?)", [
        deckId,
        itemId,
      ]);
    }
  });
}
