# Database Documentation

SQLite database schema for the Pali Learning App using `expo-sqlite`.

## Overview

**Database**: `pali.db` (Schema v2)

The database provides offline-first storage for:

- Pali vocabulary items (words, prefixes, suffixes, roots, particles)
- Spaced repetition study state tracking
- User-created decks for organizing study materials

**Key Features**:

- **Bidirectional Study**: Each item can be studied in two directions (Pali→Meaning and Meaning→Pali)
- **Foreign Key Constraints**: Automatic cascade deletion maintains referential integrity
- **Version-Based Migrations**: Schema changes tracked and applied incrementally
- **Type-Safe**: Full TypeScript type coverage

## Configuration

```sql
PRAGMA foreign_keys = ON;       -- Enforce foreign key constraints
PRAGMA journal_mode = WAL;      -- Write-Ahead Logging for better concurrency
PRAGMA user_version = 2;        -- Current schema version
```

## Schema

### `items`

Stores all Pali learning items (words, grammatical elements, etc.).

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,              -- word, prefix, suffix, root, particle
  pali TEXT NOT NULL,
  meaning TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_items_pali ON items(pali);
```

**TypeScript Types**:

```typescript
type ItemType = "word" | "prefix" | "suffix" | "root" | "particle";

type ItemRow = {
  id: number;
  type: string;
  pali: string;
  meaning: string;
  notes: string | null;
  created_at: string;
};

type Item = {
  id: number;
  type: ItemType;
  pali: string;
  meaning: string;
  notes: string | null;
  createdAt: Date;
};
```

### `study_states`

Tracks spaced repetition state for each item in each study direction.

```sql
CREATE TABLE study_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  direction TEXT NOT NULL,         -- pali_to_meaning | meaning_to_pali
  interval INTEGER NOT NULL DEFAULT 0,  -- days until next review
  ease REAL NOT NULL DEFAULT 2.5,       -- difficulty multiplier
  due TEXT NOT NULL DEFAULT (datetime('now')),
  suspended INTEGER NOT NULL DEFAULT 0, -- 0=active, 1=suspended
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(item_id, direction)
);
```

**Study Directions**:

Each item has **two independent study states**:

- `pali_to_meaning`: User sees Pali text and recalls meaning (e.g., "mettā" → "loving-kindness")
- `meaning_to_pali`: User sees meaning and recalls Pali text (e.g., "loving-kindness" → "mettā")

These are tracked separately because proficiency often differs by direction.

**Spaced Repetition Fields**:

- **`interval`** (INTEGER): Days until next review
  - `0` = New card (never studied)
  - `1` = Review tomorrow
  - `7` = Review in one week
  - `30` = Review in one month
  - Increases on correct answers, resets on incorrect answers

- **`ease`** (REAL): Ease factor determining how quickly intervals grow
  - Default: `2.5` (moderate difficulty)
  - Range: Typically `1.3` to `3.0`
  - Higher ease = intervals grow faster (easy cards)
  - Lower ease = intervals grow slower (hard cards)
  - Adjusted based on review performance

- **`due`** (TEXT): SQLite datetime string when the card should be reviewed
  - Format: `YYYY-MM-DD HH:MM:SS` (e.g., `2026-02-05 14:30:00`)
  - Cards are "due" when `due <= datetime('now')` in SQLite queries
  - **Note**: SQLite stores times in UTC. When converting to JavaScript Date, use `new Date(row.due + 'Z')` to preserve UTC interpretation

- **`suspended`** (INTEGER): User can pause cards temporarily
  - `0` = Active (show in reviews)
  - `1` = Suspended (hide from reviews)

**TypeScript Types**:

```typescript
type StudyDirection = "pali_to_meaning" | "meaning_to_pali";

type StudyStateRow = {
  id: number;
  item_id: number;
  direction: string;
  interval: number;
  ease: number;
  due: string;
  suspended: number;
};

type StudyState = {
  id: number;
  itemId: number;
  direction: StudyDirection;
  interval: number;
  ease: number;
  due: Date;
  suspended: boolean;
};
```

### `decks`

Named collections for organizing items, with per-deck study direction preference.

```sql
CREATE TABLE decks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  study_direction TEXT DEFAULT 'random'  -- pali_first | meaning_first | random
);

-- Default deck created on initialization (id=1)
INSERT OR IGNORE INTO decks (id, name) VALUES (1, 'All');
```

**Study Direction** (`study_direction`): Controls which card direction is shown during study sessions:

- `random` (default) — Both `pali_to_meaning` and `meaning_to_pali` cards are included
- `pali_first` — Only `pali_to_meaning` cards (show Pali, recall meaning)
- `meaning_first` — Only `meaning_to_pali` cards (show meaning, recall Pali)

**Constants**:

```typescript
export const DEFAULT_DECK_ID = 1;
```

**TypeScript Types**:

```typescript
type DeckStudyDirection = "pali_first" | "meaning_first" | "random";

type DeckRow = {
  id: number;
  name: string;
  created_at: string;
  study_direction: string | null;
};

type Deck = {
  id: number;
  name: string;
  createdAt: Date;
  studyDirection: DeckStudyDirection;
};
```

### `deck_items`

Join table creating many-to-many relationship between decks and items.

```sql
CREATE TABLE deck_items (
  deck_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  PRIMARY KEY (deck_id, item_id),
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

**Relationship**: One item can belong to multiple decks, one deck can contain multiple items.

## Relationships

```
┌─────────┐
│  items  │◄──┐
└─────────┘   │
     △        │ FK (CASCADE)
     │        │
     │     ┌──────────────┐
     │     │study_states  │
     │     └──────────────┘
     │
     │     ┌─────────────┐
     └─────┤ deck_items  │
           └─────────────┘
                  │
           ┌─────────┐
           │  decks  │
           └─────────┘
```

**Cascade Deletion Behavior**:

- **Delete an item**: Automatically deletes all `study_states` and `deck_items` for that item
- **Delete a deck**: Automatically deletes all `deck_items` for that deck (items remain)

### Study Cards (Derived Type)

The `StudyCard` type combines item data with study state for use in study sessions. It is not a database table but a query result type.

```typescript
type StudyCard = {
  studyStateId: number;
  itemId: number;
  direction: StudyDirection;
  pali: string;
  meaning: string;
  type: ItemType;
  interval: number;
  ease: number;
  due: Date;
};
```

## Common Queries

### Get Due Cards for a Deck

```sql
SELECT
  ss.id as study_state_id,
  ss.item_id,
  ss.direction,
  i.pali,
  i.meaning,
  i.type,
  ss.interval,
  ss.ease,
  ss.due
FROM study_states ss
JOIN items i ON ss.item_id = i.id
JOIN deck_items di ON i.id = di.item_id
WHERE di.deck_id = ?
  AND ss.due <= datetime('now')
  AND ss.suspended = 0
  AND (? IS NULL OR ss.direction = ?)  -- Optional direction filter
ORDER BY RANDOM();
```

### Get All Items in a Deck

```sql
SELECT items.*
FROM items
JOIN deck_items ON items.id = deck_items.item_id
WHERE deck_items.deck_id = 2
ORDER BY items.pali ASC;
```

### Search Items by Pali Text

```sql
-- Exact match
SELECT * FROM items WHERE pali = 'mettā';

-- Prefix search (uses index)
SELECT * FROM items WHERE pali LIKE 'mett%';

-- Full-text search (case-insensitive)
SELECT * FROM items WHERE pali LIKE '%mett%' COLLATE NOCASE;
```

### Get Study Statistics

```sql
SELECT
  direction,
  COUNT(*) as total_cards,
  SUM(CASE WHEN due <= datetime('now') THEN 1 ELSE 0 END) as due_cards,
  SUM(CASE WHEN suspended = 1 THEN 1 ELSE 0 END) as suspended_cards,
  AVG(interval) as avg_interval,
  AVG(ease) as avg_ease
FROM study_states
GROUP BY direction;
```

## TypeScript Usage

### Importing Types

```typescript
import {
  useSQLiteContext,
  itemRepository,
  deckRepository,
  studyRepository,
  DEFAULT_DECK_ID,
  type Item,
  type ItemRow,
  type StudyState,
  type StudyCard,
  type Deck,
  type ItemType,
  type StudyDirection,
  type DeckStudyDirection,
} from "@/db";
```

### Using the Repository Layer

The recommended way to interact with the database is through the repository layer in `db/repositories/`:

#### Item Repository

```typescript
import { useSQLiteContext, itemRepository } from "@/db";

function MyComponent() {
  const db = useSQLiteContext();

  // Fetch all items
  const items = await itemRepository.getAll(db);

  // Search items
  const results = await itemRepository.search(db, "dhamma");

  // Create item (auto-creates study states and adds to default deck)
  const newItem = await itemRepository.create(db, {
    type: "word",
    pali: "dhamma",
    meaning: "teaching",
  });

  // Update item
  const updated = await itemRepository.update(db, 1, { meaning: "truth" });

  // Delete item (cascades to study_states and deck_items)
  const deleted = await itemRepository.deleteItem(db, 1);
}
```

#### Deck Repository

```typescript
import { useSQLiteContext, deckRepository } from "@/db";

function MyComponent() {
  const db = useSQLiteContext();

  // Fetch all decks with item counts (sortable)
  const decks = await deckRepository.getAll(db, "name_asc");

  // Get a single deck by ID
  const deck = await deckRepository.getById(db, 2);

  // Search decks by name
  const results = await deckRepository.search(db, "verbs");

  // Check if a deck name already exists
  const exists = await deckRepository.nameExists(db, "Verbs");

  // Create a deck (validates name uniqueness, rejects reserved "All" name)
  const newDeck = await deckRepository.create(db, "Vocabulary");

  // Update a deck name
  const updated = await deckRepository.update(db, 2, "New Name");

  // Delete a deck (cascade deletes deck_items; items remain)
  const deleted = await deckRepository.deleteDeck(db, 2);

  // Get items in a deck
  const items = await deckRepository.getItemsInDeck(db, 2);

  // Get items NOT in a deck (for add-items modal)
  const available = await deckRepository.getItemsNotInDeck(db, 2);

  // Add items to a deck (uses INSERT OR IGNORE, wrapped in transaction)
  await deckRepository.addItemsToDeck(db, 2, [1, 2, 3]);

  // Remove a single item from a deck
  const removed = await deckRepository.removeItemFromDeck(db, 2, 1);
}
```

**Additional Deck Operations**:

```typescript
// Update a deck's study direction preference
await deckRepository.updateStudyDirection(db, 2, "pali_first");
```

**Sort Options** (`SortOption`): `name_asc`, `name_desc`, `date_asc`, `date_desc`, `count_asc`, `count_desc`

**Validation Rules**:

- Deck names cannot be empty or whitespace-only
- The reserved name "All" (case-insensitive) cannot be used
- Deck names must be unique (case-insensitive)
- The default "All" deck (id=1) cannot be renamed, deleted, or have items removed

#### Study Repository

```typescript
import { useSQLiteContext, studyRepository } from "@/db";

function MyComponent() {
  const db = useSQLiteContext();

  // Get due cards for a deck (filtered by due date, respects direction preference)
  const dueCards = await studyRepository.getDueCardsForDeck(db, deckId, "random");

  // Get all cards for a deck (endless mode, ignores due date)
  const allCards = await studyRepository.getAllCardsForDeck(db, deckId, "pali_first");

  // Record a review result (updates interval, ease, and due date)
  await studyRepository.recordReview(db, studyStateId, true); // correct
  await studyRepository.recordReview(db, studyStateId, false); // incorrect
}
```

**Review Algorithm**:

- **Correct**: `interval = min(max(1, interval * ease), 30)`, due date advanced by new interval
- **Incorrect**: `interval = 0`, `ease = max(ease - 0.2, 1.3)`, due date set to now

### Direct Database Access

For queries not covered by the repository, use `useSQLiteContext` directly:

```typescript
import { useSQLiteContext } from "@/db";

function MyComponent() {
  const db = useSQLiteContext();

  async function fetchItems() {
    const items = await db.getAllAsync<ItemRow>("SELECT * FROM items ORDER BY pali");
    return items;
  }
}
```

### Type Conversions

The repository layer handles row-to-model conversion internally using `parseSqliteDate()` from `db/utils.ts`:

```typescript
import { parseSqliteDate } from "@/db/utils";

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    type: row.type as ItemType,
    pali: row.pali,
    meaning: row.meaning,
    notes: row.notes,
    createdAt: parseSqliteDate(row.created_at),
  };
}
```

**Important**: Always use `parseSqliteDate()` instead of `new Date()` for SQLite datetime strings. SQLite's `datetime('now')` returns UTC without a timezone indicator (e.g., `"2026-02-24 14:30:00"`), so the utility appends `'Z'` to ensure JavaScript parses it as UTC.

## Migration System

**Current Version**: 2

Migrations run automatically on app startup via `migrateDbIfNeeded()` in [db/database.ts](../db/database.ts).

### Migration History

| Version | Change                                                  | SQL                                                                  |
| ------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| 0 → 1   | Initial schema (items, study_states, decks, deck_items) | `CREATE TABLE ...`                                                   |
| 1 → 2   | Add study direction preference to decks                 | `ALTER TABLE decks ADD COLUMN study_direction TEXT DEFAULT 'random'` |

### Adding New Migrations

To add a migration (e.g., version 2 → 3):

1. **Update schema version** in [db/schema.ts](../db/schema.ts):

   ```typescript
   export const SCHEMA_VERSION = 3;
   ```

2. **Add migration SQL** in [db/schema.ts](../db/schema.ts):

   ```typescript
   export const MIGRATION_ADD_NEW_FIELD = `
     ALTER TABLE items ADD COLUMN example TEXT
   `;
   ```

3. **Add migration logic** in [db/database.ts](../db/database.ts):

   ```typescript
   if (version === 2) {
     console.log("[DB] Running migration 2 -> 3: Add example field");
     await db.execAsync(MIGRATION_ADD_NEW_FIELD);
     version = 3;
     console.log("[DB] Migration 2 -> 3 completed");
   }
   ```

4. **Update types** in [db/types.ts](../db/types.ts) if schema changed

### Migration Best Practices

- Increment version numbers sequentially
- Use transactions for complex migrations
- Log each migration step for debugging
- Keep migrations idempotent when possible (use `IF NOT EXISTS`, etc.)

## Export/Import

The app supports full database export and import via JSON files, accessible from the Settings tab.

### Export (`exportDatabaseAsJson`)

Exports all 4 tables (`items`, `study_states`, `decks`, `deck_items`) as a JSON file and opens the system share dialog.

```typescript
import { exportDatabaseAsJson } from "@/db/repositories/exportRepository";

const filepath = await exportDatabaseAsJson(db);
```

**Export format** (`ExportData`):

```json
{
  "exportedAt": "2026-02-20T12:00:00.000Z",
  "schemaVersion": 2,
  "data": {
    "items": [...],
    "studyStates": [...],
    "decks": [...],
    "deckItems": [...]
  }
}
```

### Import (`importDatabaseFromJson`)

Opens a document picker for the user to select a JSON export file, validates the schema version, then replaces all existing data.

```typescript
import { importDatabaseFromJson } from "@/db/repositories/exportRepository";

const result = await importDatabaseFromJson(db);
// result: { itemsImported, studyStatesImported, decksImported, deckItemsImported } | null
```

**Import behavior**:

- Validates that the file's `schemaVersion` is not newer than the app's current version
- Clears all existing data (preserves the default "All" deck with id=1)
- Inserts data in dependency order: items → study_states → decks → deck_items
- Returns `null` if the user cancels the file picker

## File Structure

```
db/
├── index.ts              # Main exports, single import point
├── types.ts              # TypeScript type definitions
├── schema.ts             # SQL schema definitions, constants, and migration SQL
├── database.ts           # Migration logic and initialization
├── utils.ts              # Utilities (parseSqliteDate for UTC datetime handling)
└── repositories/
    ├── index.ts           # Repository exports
    ├── itemRepository.ts  # Item CRUD with auto study state creation
    ├── deckRepository.ts  # Deck CRUD, deck-item management, study direction
    ├── studyRepository.ts # Study session queries and review recording
    └── exportRepository.ts # JSON export/import of full database

app/
└── _layout.tsx           # SQLiteProvider setup
```

---

**Schema Version**: 2
**Last Updated**: 2026-02-25
