// SQL schema definitions for the Pali flashcard database

/**
 * Current database schema version
 */
export const SCHEMA_VERSION = 1;

// ============================================================================
// Items Table
// ============================================================================

/**
 * Items table - stores all Pali learning items (words, prefixes, suffixes, etc.)
 */
export const CREATE_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    pali TEXT NOT NULL,
    meaning TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

/**
 * Index on pali column for fast lookups and search
 */
export const CREATE_ITEMS_PALI_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_items_pali ON items(pali)
`;

// ============================================================================
// Study States Table
// ============================================================================

/**
 * Study states table - tracks spaced repetition state for each item and direction
 *
 * Each item has two study states (one per direction):
 * - pali_to_meaning: Show Pali, recall meaning
 * - meaning_to_pali: Show meaning, recall Pali
 */
export const CREATE_STUDY_STATES_TABLE = `
  CREATE TABLE IF NOT EXISTS study_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    direction TEXT NOT NULL,
    interval INTEGER NOT NULL DEFAULT 0,
    ease REAL NOT NULL DEFAULT 2.5,
    due TEXT NOT NULL DEFAULT (datetime('now')),
    suspended INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE(item_id, direction)
  )
`;

// ============================================================================
// Decks Table
// ============================================================================

/**
 * Decks table - stores named collections of items
 */
export const CREATE_DECKS_TABLE = `
  CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

// ============================================================================
// Deck Items Table (Join Table)
// ============================================================================

/**
 * Deck items table - join table linking items to decks
 * Allows many-to-many relationship between decks and items
 */
export const CREATE_DECK_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS deck_items (
    deck_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    PRIMARY KEY (deck_id, item_id),
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  )
`;

// ============================================================================
// Default Data
// ============================================================================

/**
 * Insert default "All" deck that contains all items
 * Uses id=1 as the default deck ID
 */
export const INSERT_DEFAULT_DECK = `
  INSERT OR IGNORE INTO decks (id, name) VALUES (1, 'All')
`;

/**
 * Default deck ID constant
 */
export const DEFAULT_DECK_ID = 1;
