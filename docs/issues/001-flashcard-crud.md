# Issue 001: Flashcard CRUD Operations

## Overview

Implement a screen for managing flashcard items (view, add, edit, delete). This is a core MVP feature enabling users to build and maintain their Pali vocabulary library.

## User Stories

- As a user, I can view all my flashcard items in a searchable list
- As a user, I can add a new item with Pali text, meaning, type, and optional notes
- As a user, I can assign an item to one or more decks when creating it
- As a user, I can edit an existing item's details
- As a user, I can delete an item with a confirmation prompt
- As a user, I can search/filter items by Pali text or meaning

## UI Requirements

### Navigation

Introduce a **bottom tab navigator** with at least two tabs:

- **Home** - Current home screen
- **Library** - Flashcard management screen (this issue)

Future tabs (e.g., Study, Settings) can be added later.

### Library Screen

A searchable list view displaying all items from the `items` table.

**List View:**

- Each row shows: Pali text, meaning, and item type badge
- Tapping a row opens the edit modal/screen
- Search bar at the top filters by Pali or meaning (case-insensitive)
- Floating action button (FAB) or header button to add new item

**Empty State:**

- Friendly message when no items exist
- Prominent "Add your first item" button

### Add/Edit Screen (or Modal)

Form fields:

| Field   | Type          | Required | Notes                                        |
| ------- | ------------- | -------- | -------------------------------------------- |
| Pali    | Text input    | Yes      | The Pali word/element                        |
| Meaning | Text input    | Yes      | English meaning                              |
| Type    | Picker/Select | No       | word, prefix, suffix, root, particle, other (user-defined)  |
| Notes   | Text area     | No       | Optional notes (etymology, usage, etc.)      |
| Decks   | Multi-select  | No       | Defaults to "All" deck, allow adding to more |

**Behavior:**

- Save button validates required fields
- On save, create/update the item
- On create, automatically create two `study_states` records (pali_to_meaning, meaning_to_pali)
- On create, add item to selected decks via `deck_items`

### Delete Confirmation

- Tapping delete shows an Alert dialog: "Delete this item? This cannot be undone."
- Confirm deletes the item (cascade removes study_states and deck_items)
- Cancel dismisses the dialog

### UUID Generation

Use a UUID library or `expo-crypto` for generating item IDs:

```typescript
import * as Crypto from 'expo-crypto';
const id = Crypto.randomUUID();
```

## Acceptance Criteria

- [ ] Bottom tab navigator with Home and Library tabs
- [ ] Library screen displays all items in a scrollable list
- [ ] Search bar filters items by Pali text or meaning
- [ ] Can add a new item with all 5 types supported
- [ ] Creating an item auto-creates both study state directions
- [ ] Can assign item to decks during creation
- [ ] Can edit an existing item
- [ ] Can delete an item with confirmation dialog
- [ ] Empty state shown when no items exist
- [ ] All CRUD operations persist to SQLite database

## Out of Scope

- Diacritics input helper (separate issue)
- Bulk import/export
- Deck management (create/edit/delete decks)
- Sorting options beyond alphabetical
- Pagination (not needed for personal use scale)

## Related Documents

- [DATABASE.md](../DATABASE.md) - Schema reference
- [PRODUCT_VISION.md](../PRODUCT_VISION.md) - MVP success criteria

## AI Plan

Flashcard CRUD Implementation Plan
Summary
Implement flashcard item management with a Library screen for viewing, adding, editing, and deleting Pali learning items. This includes restructuring navigation to use bottom tabs.

Workflow: After each phase, we sync up for manual approval, commit, then proceed to the next phase.

Phase 0: Schema Reset (Pre-requisite)
Reset the database schema to use INTEGER auto-increment IDs instead of TEXT UUIDs.

Files to modify:

db/schema.ts - Change id TEXT PRIMARY KEY NOT NULL to id INTEGER PRIMARY KEY AUTOINCREMENT
db/types.ts - Change id: string to id: number in all types
db/database.ts - Reset schema version (drop and recreate tables)
app/index.tsx - Fix any ID references
Tables affected:

items: id INTEGER PRIMARY KEY AUTOINCREMENT
study_states: id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER
decks: id INTEGER PRIMARY KEY AUTOINCREMENT
deck_items: deck_id INTEGER, item_id INTEGER
Checkpoint: Verify app launches and database initializes correctly.

Phase 1: Navigation Foundation
Set up bottom tab navigation with Home and Library tabs.

Files to create:

app/(tabs)/_layout.tsx - Tab navigator with Home and Library tabs
app/(tabs)/index.tsx - Home tab (content moved from app/index.tsx)
app/(tabs)/library.tsx - Placeholder Library screen
Files to modify:

app/_layout.tsx - Update Stack to include (tabs) group
Implementation:

Create tab layout with Ionicons (home, library icons)
Move home screen content to app/(tabs)/index.tsx
Create placeholder library screen
Update root layout:

<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="item/add" options={{ title: 'Add Item' }} />
  <Stack.Screen name="item/[id]" options={{ title: 'Edit Item' }} />
</Stack>
Checkpoint: Tabs work, can switch between Home and Library.

Phase 2: Data Layer
Create repository for item CRUD operations.

Files to create:

db/repositories/itemRepository.ts - Item CRUD with study state auto-creation
db/repositories/index.ts - Exports
Repository API:

getAll() - Fetch all items ordered by pali
getById(id) - Fetch single item
search(query) - Case-insensitive search on pali/meaning
create(item, deckIds) - Insert item + 2 study_states + deck_items
update(id, item) - Update item fields
delete(id) - Delete item (cascades via foreign keys)
getDecksForItem(itemId) - Get item's decks
getAllDecks() - Get all decks for picker
Auto-create study states on item creation:

for (const direction of ['pali_to_meaning', 'meaning_to_pali']) {
  await db.runAsync(
    'INSERT INTO study_states (item_id, direction) VALUES (?, ?)',
    [itemId, direction]
  );
}
Checkpoint: Repository tests pass, can create/read/update/delete items.

Phase 3: Library Screen
Build the main library view with search and item list.

Files to create:

components/items/ItemCard.tsx - Row with Pali text, meaning, type badge
components/items/EmptyState.tsx - Message + "Add first item" button
components/items/ItemList.tsx - FlatList with search bar
Files to modify:

app/(tabs)/library.tsx - Full implementation
Features:

FlatList displaying all items
Search bar filters by pali or meaning (case-insensitive)
Empty state when no items exist
FAB or header button to add new item
Tap item to navigate to edit screen
Checkpoint: Can see items list, search works, empty state shows.

Phase 4: Add/Edit Screens
Build form screens for creating and editing items.

Files to create:

app/item/_layout.tsx - Stack layout for item routes
app/item/add.tsx - Add new item screen
app/item/[id].tsx - Edit existing item screen
components/items/ItemForm.tsx - Reusable form component
components/items/ItemTypePicker.tsx - Type selector
components/items/DeckPicker.tsx - Multi-select deck picker
Form fields:

Field Type Required Default
Pali TextInput Yes -
Meaning TextInput Yes -
Type Picker No 'word'
Notes TextInput (multiline) No -
Decks Multi-select No ['all']
Delete confirmation:

Alert.alert('Delete Item', 'Delete this item? This cannot be undone.', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'Delete', style: 'destructive', onPress: handleDelete },
]);
Checkpoint: Can add, edit, and delete items. All CRUD operations work end-to-end.

Phase 5: Testing & Polish
Add tests and polish the implementation.

Tests to add:

Repository unit tests with mocked SQLiteDatabase
Component tests for ItemCard, ItemForm, ItemList, EmptyState
Screen tests for Library, Add, Edit screens
Update navigation integration tests for tabs
Polish:

Loading states while fetching data
Error handling for database operations
Keyboard handling for forms (KeyboardAvoidingView)
Checkpoint: All tests pass (pnpm test), no lint errors (pnpm lint).

Key Design Decisions
Decision Choice Rationale
ID type INTEGER auto-increment Simpler than UUIDs
Add/Edit UI Separate screens Better UX for 5-field form
Tab type expo-router Tabs Stable API in SDK 54
Repository layer Yes Encapsulates SQL, testable
Default type 'word' Most common use case
Default deck 'all' Always add to All deck
Final Verification
Manual testing:

Navigate between Home and Library tabs
Add a new item with all fields
Verify item appears in Library list
Search for item by Pali and meaning
Edit item and verify changes persist
Delete item with confirmation
Verify empty state shows when no items
Database verification:

After creating item, verify 2 study_states exist (both directions)
Verify deck_items entry created for 'all' deck
After deleting item, verify cascaded deletes
