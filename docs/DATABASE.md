# Database Documentation

This document describes the SQLite database schema for the Pali Learning App, including tables, relationships, and usage patterns.

## Overview

The database uses **SQLite** via `expo-sqlite` to provide offline-first storage for:

- Pali vocabulary items (words, prefixes, suffixes, roots, particles)
- Spaced repetition study state tracking
- User-created decks for organizing study materials

### Key Features

- **Bidirectional Study**: Each item can be studied in two directions (Pali→Meaning and Meaning→Pali)
- **Foreign Key Constraints**: Automatic cascade deletion maintains referential integrity
- **Version-Based Migrations**: Schema changes are tracked and applied incrementally
- **Type-Safe**: Full TypeScript type coverage for all database operations

## Database Configuration

### Pragmas

The following SQLite pragmas are enabled on initialization:

```sql
PRAGMA foreign_keys = ON;      -- Enforce foreign key constraints
PRAGMA journal_mode = WAL;      -- Write-Ahead Logging for better concurrency
PRAGMA user_version = 1;        -- Current schema version
```

### Location

- **Database name**: `pali.db`
- **iOS**: App sandbox Documents directory
- **Android**: `/data/data/[package]/databases/pali.db`
- **Web**: IndexedDB (via expo-sqlite polyfill)

## Schema Version

**Current Version**: 1

Schema version is tracked using `PRAGMA user_version` and migrations are applied automatically on app startup via the `migrateDbIfNeeded` function.

## Tables

### 1. `items`

Stores all Pali learning items (words, grammatical elements, etc.).

#### Schema

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  pali TEXT NOT NULL,
  meaning TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_items_pali ON items(pali);
```

#### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | TEXT | No | Unique identifier (UUID/ULID recommended) |
| `type` | TEXT | No | Item type: `word`, `prefix`, `suffix`, `root`, `particle` |
| `pali` | TEXT | No | The Pali text/word |
| `meaning` | TEXT | No | English translation or meaning |
| `notes` | TEXT | Yes | Optional additional notes or context |
| `created_at` | TEXT | No | ISO 8601 timestamp (auto-generated) |

#### Indexes

- **`idx_items_pali`**: B-tree index on `pali` column for fast lookups and search

#### TypeScript Types

```typescript
type ItemType = 'word' | 'prefix' | 'suffix' | 'root' | 'particle';

type ItemRow = {
  id: string;
  type: string;
  pali: string;
  meaning: string;
  notes: string | null;
  created_at: string;
};

type Item = {
  id: string;
  type: ItemType;
  pali: string;
  meaning: string;
  notes: string | null;
  createdAt: Date;
};
```

#### Example Data

```sql
INSERT INTO items (id, type, pali, meaning, notes) VALUES
  ('abc123', 'word', 'mettā', 'loving-kindness', 'One of the four Brahmavihāras'),
  ('def456', 'word', 'dhamma', 'teaching, doctrine, truth', 'One of the Three Jewels'),
  ('ghi789', 'prefix', 'ā', 'towards, near', 'Common verbal prefix');
```

---

### 2. `study_states`

Tracks spaced repetition state for each item in each study direction.

#### Schema

```sql
CREATE TABLE study_states (
  id TEXT PRIMARY KEY NOT NULL,
  item_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  interval INTEGER NOT NULL DEFAULT 0,
  ease REAL NOT NULL DEFAULT 2.5,
  due TEXT NOT NULL DEFAULT (datetime('now')),
  suspended INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE(item_id, direction)
);
```

#### Fields

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | TEXT | No | - | Unique identifier |
| `item_id` | TEXT | No | - | Foreign key to `items.id` |
| `direction` | TEXT | No | - | Study direction: `pali_to_meaning` or `meaning_to_pali` |
| `interval` | INTEGER | No | 0 | Days until next review (0 = new card) |
| `ease` | REAL | No | 2.5 | Ease factor (difficulty multiplier) |
| `due` | TEXT | No | now | ISO 8601 timestamp when card is due |
| `suspended` | INTEGER | No | 0 | Boolean flag (0 = active, 1 = suspended) |

#### Constraints

- **UNIQUE(item_id, direction)**: Ensures only one study state per item per direction
- **FOREIGN KEY with CASCADE**: Deleting an item automatically deletes its study states

#### TypeScript Types

```typescript
type StudyDirection = 'pali_to_meaning' | 'meaning_to_pali';

type StudyStateRow = {
  id: string;
  item_id: string;
  direction: string;
  interval: number;
  ease: number;
  due: string;
  suspended: number;
};

type StudyState = {
  id: string;
  itemId: string;
  direction: StudyDirection;
  interval: number;
  ease: number;
  due: Date;
  suspended: boolean;
};
```

#### Study Directions

Each item has **two independent study states**:

1. **`pali_to_meaning`**: User sees the Pali text and must recall the meaning
   - Example: Show "mettā" → User recalls "loving-kindness"

2. **`meaning_to_pali`**: User sees the meaning and must recall the Pali text
   - Example: Show "loving-kindness" → User recalls "mettā"

These are tracked separately because proficiency often differs by direction.

#### Spaced Repetition Fields

##### `interval` (Days)

The number of days until the next review:

- `0` = New card (never studied)
- `1` = Review tomorrow
- `7` = Review in one week
- `30` = Review in one month

After each review, the interval is adjusted based on performance:

- **Correct answer**: Interval increases (typically multiplied by ease factor)
- **Incorrect answer**: Interval resets to 1 day or a short interval

##### `ease` (Multiplier)

The ease factor determines how quickly intervals grow:

- **Default**: `2.5` (moderate difficulty)
- **Range**: Typically `1.3` to `3.0`
- **Higher ease** (e.g., `2.8`): Easy card, intervals grow faster
- **Lower ease** (e.g., `2.0`): Hard card, intervals grow more slowly

Adjusted based on review performance:

- Mark "Easy": Increase ease
- Mark "Hard": Decrease ease

##### `due` (Timestamp)

ISO 8601 timestamp indicating when the card should be reviewed:

```
2026-02-05T14:30:00.000Z
```

Cards are considered "due" when `due <= current_time`.

##### `suspended` (Boolean)

User can suspend cards to temporarily remove them from review:

- `0` = Active (show in reviews)
- `1` = Suspended (hide from reviews)

Useful for cards that are:

- Too difficult right now
- Not relevant to current study goals
- Need to be reviewed later

#### Example Data

```sql
-- Item "mettā" has two study states (one per direction)

-- Pali → Meaning direction (well learned)
INSERT INTO study_states VALUES (
  'state001',
  'abc123',
  'pali_to_meaning',
  30,                          -- Review in 30 days
  2.7,                         -- Slightly easier than default
  '2026-03-07T10:00:00Z',      -- Due date
  0                            -- Active
);

-- Meaning → Pali direction (needs more practice)
INSERT INTO study_states VALUES (
  'state002',
  'abc123',
  'meaning_to_pali',
  1,                           -- Review tomorrow
  2.2,                         -- Slightly harder than default
  '2026-02-06T10:00:00Z',      -- Due tomorrow
  0                            -- Active
);
```

---

### 3. `decks`

Stores named collections of items for organizing study materials.

#### Schema

```sql
CREATE TABLE decks (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | TEXT | No | Unique identifier |
| `name` | TEXT | No | Display name for the deck |
| `created_at` | TEXT | No | ISO 8601 timestamp (auto-generated) |

#### TypeScript Types

```typescript
type DeckRow = {
  id: string;
  name: string;
  created_at: string;
};

type Deck = {
  id: string;
  name: string;
  createdAt: Date;
};
```

#### Default Deck

A default "All" deck is created automatically on database initialization:

```sql
INSERT INTO decks (id, name) VALUES ('all', 'All');
```

This deck serves as a catch-all collection for all items.

#### Example Data

```sql
INSERT INTO decks (id, name) VALUES
  ('all', 'All'),
  ('basics', 'Basic Vocabulary'),
  ('grammar', 'Grammar Elements'),
  ('suttas', 'Sutta Terms');
```

---

### 4. `deck_items`

Join table that creates a many-to-many relationship between decks and items.

#### Schema

```sql
CREATE TABLE deck_items (
  deck_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  PRIMARY KEY (deck_id, item_id),
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);
```

#### Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `deck_id` | TEXT | No | Foreign key to `decks.id` |
| `item_id` | TEXT | No | Foreign key to `items.id` |

#### Constraints

- **PRIMARY KEY (deck_id, item_id)**: Composite primary key prevents duplicate entries
- **FOREIGN KEY with CASCADE**: Deleting a deck or item removes the associations

#### TypeScript Types

```typescript
type DeckItemRow = {
  deck_id: string;
  item_id: string;
};

type DeckItem = {
  deckId: string;
  itemId: string;
};
```

#### Relationship

- One item can belong to **multiple decks**
- One deck can contain **multiple items**

#### Example Data

```sql
-- Add "mettā" to multiple decks
INSERT INTO deck_items (deck_id, item_id) VALUES
  ('all', 'abc123'),       -- In "All" deck
  ('basics', 'abc123');    -- In "Basic Vocabulary" deck

-- Add "dhamma" to multiple decks
INSERT INTO deck_items (deck_id, item_id) VALUES
  ('all', 'def456'),
  ('basics', 'def456'),
  ('suttas', 'def456');
```

---

## Relationships

### Entity Relationship Diagram

```
┌─────────┐
│  items  │
│─────────│
│ id (PK) │◄─────────┐
│ type    │          │
│ pali    │          │
│ meaning │          │
│ notes   │          │
│created_at│         │
└─────────┘          │
     △               │
     │               │
     │ FK (CASCADE)  │
     │               │
┌──────────────┐     │
│study_states  │     │
│──────────────│     │
│ id (PK)      │     │
│ item_id (FK) ├─────┘
│ direction    │
│ interval     │
│ ease         │
│ due          │
│ suspended    │
└──────────────┘

┌─────────┐         ┌─────────────┐         ┌─────────┐
│  decks  │         │ deck_items  │         │  items  │
│─────────│         │─────────────│         │─────────│
│ id (PK) │◄────────┤deck_id (FK) │    ┌───►│ id (PK) │
│ name    │         │item_id (FK) ├────┘    │  ...    │
│created_at│        └─────────────┘         └─────────┘
└─────────┘
```

### Cascade Deletion Behavior

#### Deleting an Item

When an item is deleted, the following happens automatically:

1. All `study_states` for that item are deleted (both directions)
2. All `deck_items` associations are deleted

```sql
-- Delete an item
DELETE FROM items WHERE id = 'abc123';

-- Automatically deletes:
-- - study_states where item_id = 'abc123'
-- - deck_items where item_id = 'abc123'
```

#### Deleting a Deck

When a deck is deleted:

1. All `deck_items` associations for that deck are deleted
2. The items themselves remain (they may still be in other decks)

```sql
-- Delete a deck
DELETE FROM decks WHERE id = 'basics';

-- Automatically deletes:
-- - deck_items where deck_id = 'basics'
-- Items remain untouched
```

---

## Common Queries

### Get All Due Cards for Review

Get all cards due for review in a specific direction:

```sql
SELECT
  items.*,
  study_states.direction,
  study_states.interval,
  study_states.ease,
  study_states.due
FROM items
JOIN study_states ON items.id = study_states.item_id
WHERE
  study_states.direction = 'pali_to_meaning'
  AND study_states.due <= datetime('now')
  AND study_states.suspended = 0
ORDER BY study_states.due ASC
LIMIT 20;
```

### Get All Items in a Deck

Retrieve all items belonging to a specific deck:

```sql
SELECT items.*
FROM items
JOIN deck_items ON items.id = deck_items.item_id
WHERE deck_items.deck_id = 'basics'
ORDER BY items.pali ASC;
```

### Search Items by Pali Text

Use the indexed `pali` column for fast text search:

```sql
-- Exact match
SELECT * FROM items
WHERE pali = 'mettā';

-- Prefix search
SELECT * FROM items
WHERE pali LIKE 'mett%';

-- Full-text search (case-insensitive)
SELECT * FROM items
WHERE pali LIKE '%mett%' COLLATE NOCASE;
```

### Get Study Statistics

Count cards by state:

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

### Get Items with Both Study States

Join to get an item with both study directions:

```sql
SELECT
  items.*,
  ss1.interval as pali_to_meaning_interval,
  ss1.due as pali_to_meaning_due,
  ss2.interval as meaning_to_pali_interval,
  ss2.due as meaning_to_pali_due
FROM items
LEFT JOIN study_states ss1
  ON items.id = ss1.item_id
  AND ss1.direction = 'pali_to_meaning'
LEFT JOIN study_states ss2
  ON items.id = ss2.item_id
  AND ss2.direction = 'meaning_to_pali'
WHERE items.id = 'abc123';
```

---

## TypeScript Usage

### Importing Types

All database types are exported from `@/db`:

```typescript
import {
  useSQLiteContext,
  type Item,
  type ItemRow,
  type StudyState,
  type Deck,
  type ItemType,
  type StudyDirection
} from '@/db';
```

### Using the Database Hook

Access the database in any component:

```typescript
import { useSQLiteContext } from '@/db';

function MyComponent() {
  const db = useSQLiteContext();

  async function fetchItems() {
    const items = await db.getAllAsync<ItemRow>(
      'SELECT * FROM items ORDER BY pali'
    );
    return items;
  }

  // ...
}
```

### Type Conversions

Convert between database rows and application types:

```typescript
import type { ItemRow, Item } from '@/db';

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    type: row.type as ItemType,
    pali: row.pali,
    meaning: row.meaning,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  };
}

function itemToRow(item: Item): ItemRow {
  return {
    id: item.id,
    type: item.type,
    pali: item.pali,
    meaning: item.meaning,
    notes: item.notes,
    created_at: item.createdAt.toISOString(),
  };
}
```

---

## Migration System

### Current Version

The database is currently at **version 1** with the initial schema.

### Migration Function

Migrations are applied automatically on app startup via `migrateDbIfNeeded` in [db/database.ts](../db/database.ts).

```typescript
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // Check current version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  // Apply migrations
  if (currentVersion === 0) {
    // Create initial schema
    // ...
  }

  // Future migrations go here
  // if (currentVersion === 1) { ... }
}
```

### Adding New Migrations

To add a new migration (e.g., version 1 → 2):

1. **Update schema version** in [db/schema.ts](../db/schema.ts):

   ```typescript
   export const SCHEMA_VERSION = 2;
   ```

2. **Add migration logic** in [db/database.ts](../db/database.ts):

   ```typescript
   if (version === 1) {
     console.log('[DB] Running migration 1 -> 2: Add example field');
     await db.execAsync('ALTER TABLE items ADD COLUMN example TEXT');
     version = 2;
     console.log('[DB] Migration 1 -> 2 completed');
   }
   ```

3. **Update types** in [db/types.ts](../db/types.ts) if schema changed

4. **Test migration** by:
   - Installing the previous version
   - Adding test data
   - Upgrading to new version
   - Verifying data integrity

### Migration Best Practices

- Always increment version numbers sequentially
- Use transactions for complex migrations
- Test migrations on real data
- Never skip migration versions
- Log each migration step for debugging
- Handle errors gracefully
- Keep migrations idempotent when possible (use `IF NOT EXISTS`, etc.)

---

### Key Files

- **[db/types.ts](../db/types.ts)**: All TypeScript types for tables
- **[db/schema.ts](../db/schema.ts)**: SQL CREATE TABLE statements
- **[db/database.ts](../db/database.ts)**: Migration system
- **[db/index.ts](../db/index.ts)**: Re-exports all database functionality
- **[app/_layout.tsx](../app/_layout.tsx)**: SQLiteProvider configuration

---

## References

- [expo-sqlite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Spaced Repetition Algorithm (SM-2)](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm)

---

## Support

For issues or questions about the database:

- Check console logs for migration errors
- Verify TypeScript types match schema
- Review cascade delete behavior
- Test foreign key constraints

**Last Updated**: 2026-02-05
**Schema Version**: 1
