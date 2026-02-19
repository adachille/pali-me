// TypeScript type definitions for SQLite database tables

// ============================================================================
// Item Types
// ============================================================================

/**
 * Valid item types for Pali learning items
 */
export type ItemType = "word" | "prefix" | "suffix" | "root" | "particle";

/**
 * Raw row structure from the items table (as stored in SQLite)
 */
export type ItemRow = {
  id: number;
  type: string;
  pali: string;
  meaning: string;
  notes: string | null;
  created_at: string;
};

/**
 * Application-level Item type with proper typing and Date conversion
 */
export type Item = {
  id: number;
  type: ItemType;
  pali: string;
  meaning: string;
  notes: string | null;
  createdAt: Date;
};

/**
 * Type for inserting new items (id and created_at are auto-generated)
 */
export type ItemInsert = {
  type: ItemType;
  pali: string;
  meaning: string;
  notes?: string | null;
};

// ============================================================================
// Study State Types
// ============================================================================

/**
 * Study direction for spaced repetition
 */
export type StudyDirection = "pali_to_meaning" | "meaning_to_pali";

/**
 * Raw row structure from the study_states table (as stored in SQLite)
 */
export type StudyStateRow = {
  id: number;
  item_id: number;
  direction: string;
  interval: number;
  ease: number;
  due: string;
  suspended: number;
};

/**
 * Application-level StudyState type with proper typing and conversions
 */
export type StudyState = {
  id: number;
  itemId: number;
  direction: StudyDirection;
  interval: number;
  ease: number;
  due: Date;
  suspended: boolean;
};

/**
 * Type for inserting new study states (id is auto-generated)
 */
export type StudyStateInsert = {
  itemId: number;
  direction: StudyDirection;
  interval?: number;
  ease?: number;
  due?: Date;
  suspended?: boolean;
};

// ============================================================================
// Deck Types
// ============================================================================

/**
 * Raw row structure from the decks table (as stored in SQLite)
 */
export type DeckRow = {
  id: number;
  name: string;
  created_at: string;
};

/**
 * Application-level Deck type with Date conversion
 */
export type Deck = {
  id: number;
  name: string;
  createdAt: Date;
};

/**
 * Type for inserting new decks (id and created_at are auto-generated)
 */
export type DeckInsert = {
  name: string;
};

// ============================================================================
// Deck Item Types (Join Table)
// ============================================================================

/**
 * Raw row structure from the deck_items table (as stored in SQLite)
 */
export type DeckItemRow = {
  deck_id: number;
  item_id: number;
};

/**
 * Application-level DeckItem type
 */
export type DeckItem = {
  deckId: number;
  itemId: number;
};
