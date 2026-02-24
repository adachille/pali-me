# Issue 002: Deck Management

## Overview

Implement a user interface for deck management and browsing, utilizing the current home screen as the base. This feature enables users to organize their Pali vocabulary into custom collections beyond the default "All" deck.

## User Stories

- As a user, I can view all my decks in a searchable, sortable list
- As a user, I can create a new deck with a custom name
- As a user, I can rename an existing deck
- As a user, I can delete a deck with a confirmation prompt
- As a user, I can view all items within a specific deck
- As a user, I can add items to a deck from the deck detail view
- As a user, I can remove items from a deck

## UI Requirements

### Navigation

Repurpose the **Home tab** as the deck management hub:

- **Home** - Deck list and management (this issue)
- **Library** - All items (existing)
- **Settings** - App settings (existing)

### Home Screen (Deck List)

A searchable, sortable list view displaying all decks.

**List View:**

- Each row shows: deck name, item count, creation date
- Tapping a row opens the deck detail screen
- Search bar at the top filters decks by name (case-insensitive)
- Sort options: alphabetical (A-Z, Z-A), date created (newest, oldest), item count
- Floating action button (FAB) or header button to create new deck

**Deck Card:**

| Element    | Description                                |
| ---------- | ------------------------------------------ |
| Name       | Deck name (e.g., "Verbs", "Daily Study")   |
| Item count | Number of items in deck (e.g., "24 items") |
| Created    | Relative date (e.g., "Created 3 days ago") |

**Empty State:**

- Friendly message when no custom decks exist (excluding "All")
- Prominent "Create your first deck" button

### Deck Detail Screen

View and manage items within a specific deck.

**Header:**

- Deck name (editable via edit button)
- Item count
- Delete deck button (with confirmation)

**Item List:**

- Same layout as Library screen item list
- Each item shows: Pali text, meaning, type badge
- Swipe-to-remove or long-press context menu to remove from deck
- FAB to add items to this deck

**Add Items Modal/Screen:**

- Shows items NOT already in this deck
- Search/filter functionality
- Multi-select checkboxes
- "Add Selected" button

### Create/Edit Deck Modal

Simple modal dialog for deck name entry.

| Field | Type       | Required | Notes                             |
| ----- | ---------- | -------- | --------------------------------- |
| Name  | Text input | Yes      | Max 50 characters, must be unique |

**Validation:**

- Name cannot be empty
- Name cannot be "All" (reserved)
- Name must be unique (case-insensitive)

### Delete Confirmation

- Tapping delete shows an Alert dialog: "Delete this deck? Items will remain in your library."
- Cannot delete the "All" deck (button hidden or disabled)
- Confirm deletes the deck (items remain, only deck_items removed)
- Cancel dismisses the dialog

## Acceptance Criteria

- [ ] Home screen displays all decks in a searchable list
- [ ] Can sort decks by name, date, or item count
- [ ] Can create a new deck with validation
- [ ] Can rename an existing deck
- [ ] Can delete a deck with confirmation (except "All")
- [ ] Deck detail screen shows all items in that deck
- [ ] Can add items to a deck via multi-select
- [ ] Can remove items from a deck
- [ ] Empty state shown when no custom decks exist
- [ ] "All" deck always appears and cannot be deleted
- [ ] All operations persist to SQLite database

## Out of Scope

- Deck reordering/manual sorting
- Deck icons or colors
- Nested decks or folders
- Deck-specific study settings
- Bulk deck operations

## Technical Implementation

### Data Layer

Create repository for deck CRUD operations.

**Files to create/modify:**

- `db/repositories/deckRepository.ts` - Deck CRUD operations

**Repository API:**

```typescript
// Deck operations
getAll(db) - Fetch all decks with item counts, ordered by name
getById(db, id) - Fetch single deck with item count
create(db, name) - Insert new deck, returns created deck
update(db, id, name) - Update deck name
delete(db, id) - Delete deck (cascade removes deck_items only)

// Deck-item operations
getItemsInDeck(db, deckId) - Get all items in a deck
getItemsNotInDeck(db, deckId) - Get items NOT in a deck (for add modal)
addItemsToDeck(db, deckId, itemIds) - Add multiple items to deck
removeItemFromDeck(db, deckId, itemId) - Remove single item from deck
```

### Component Structure

**Files to create:**

```
components/decks/
├── DeckCard.tsx          - Row with name, count, date
├── DeckList.tsx          - FlatList with search and sort
├── DeckEmptyState.tsx    - Empty state for no decks
├── DeckForm.tsx          - Create/edit deck modal
├── DeckItemList.tsx      - Items in deck with remove action
└── AddItemsModal.tsx     - Multi-select to add items

app/
├── (tabs)/index.tsx      - Update to deck list view
└── deck/
    ├── _layout.tsx       - Stack layout for deck routes
    └── [id].tsx          - Deck detail screen
```

### Database Queries

**Get decks with item counts:**

```sql
SELECT
  decks.*,
  COUNT(deck_items.item_id) as item_count
FROM decks
LEFT JOIN deck_items ON decks.id = deck_items.deck_id
GROUP BY decks.id
ORDER BY decks.name ASC;
```

**Get items not in a deck:**

```sql
SELECT * FROM items
WHERE id NOT IN (
  SELECT item_id FROM deck_items WHERE deck_id = ?
)
ORDER BY pali ASC;
```

## Related Documents

- [DATABASE.md](../DATABASE.md) - Schema reference (decks, deck_items tables)
- [001-flashcard-crud.md](./001-flashcard-crud.md) - Item CRUD (related feature)
- [PRODUCT_VISION.md](../PRODUCT_VISION.md) - Product context

## AI Plan

Deck Management Implementation Plan

### Summary

Implement a deck management UI on the Home tab, enabling users to view, create, rename, delete decks, and manage deck contents. This builds on existing patterns from the Library screen and itemRepository.

**Workflow:** After each phase, sync up for manual approval, commit, then proceed to the next phase.

---

### Phase 1: Data Layer (deckRepository)

Create the repository for all deck operations.

**Files to create:**

- `db/repositories/deckRepository.ts` - Deck CRUD and deck-item operations

**Files to modify:**

- `db/repositories/index.ts` - Export deckRepository
- `db/index.ts` - Re-export from repositories

**Repository Functions:**

```typescript
// Types
type DeckWithCount = Deck & { itemCount: number };
type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'count_asc' | 'count_desc';

// Deck CRUD
getAll(db, sort?: SortOption): Promise<DeckWithCount[]>
getById(db, id): Promise<DeckWithCount | null>
search(db, query, sort?: SortOption): Promise<DeckWithCount[]>
create(db, name): Promise<Deck>
update(db, id, name): Promise<Deck | null>
deleteDeck(db, id): Promise<boolean>
nameExists(db, name, excludeId?): Promise<boolean>

// Deck-item operations
getItemsInDeck(db, deckId): Promise<Item[]>
getItemsNotInDeck(db, deckId): Promise<Item[]>
addItemsToDeck(db, deckId, itemIds): Promise<void>
removeItemFromDeck(db, deckId, itemId): Promise<boolean>
```

**Validation:**

- `create()` checks name is not empty, not "All", and unique
- `deleteDeck()` prevents deletion of DEFAULT_DECK_ID (1)
- `update()` validates new name is unique (excluding self)

**Checkpoint:** Repository functions work correctly. Can test via temporary UI or unit tests.

---

### Phase 2: Deck List Components

Build reusable components for displaying decks.

**Files to create:**

```
components/decks/
├── index.ts              - Barrel exports
├── DeckCard.tsx          - Single deck row display
├── DeckList.tsx          - FlatList with search bar
├── DeckEmptyState.tsx    - Empty state when no decks
└── DeckSortPicker.tsx    - Sort option selector
```

**DeckCard Props:**

```typescript
type DeckCardProps = {
  deck: DeckWithCount;
  onPress: (deck: DeckWithCount) => void;
};
```

- Displays: deck name, item count badge, relative created date
- Special styling for "All" deck (e.g., pin icon or different color)
- Uses same styling patterns as ItemCard (16px padding, border, shadows)

**DeckList Props:**

```typescript
type DeckListProps = {
  decks: DeckWithCount[];
  searchQuery: string;
  sortOption: SortOption;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onDeckPress: (deck: DeckWithCount) => void;
  onAddPress: () => void;
};
```

- Search bar filters by deck name
- Sort picker dropdown/modal
- FAB for creating new deck
- Renders DeckEmptyState when list is empty

**DeckEmptyState Props:**

```typescript
type DeckEmptyStateProps = {
  isSearching: boolean;
  onCreatePress: () => void;
};
```

- Different messages for "no decks" vs "no search results"
- "Create your first deck" button when not searching

**Checkpoint:** Components render correctly in isolation. Visual inspection.

---

### Phase 3: Home Screen (Deck List View)

Transform the Home tab into the deck management hub.

**Files to modify:**

- `app/(tabs)/index.tsx` - Replace current content with deck list

**Implementation:**

```typescript
// State
const [decks, setDecks] = useState<DeckWithCount[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [sortOption, setSortOption] = useState<SortOption>("name_asc");
const [isLoading, setIsLoading] = useState(true);

// Load decks on focus
useFocusEffect(
  useCallback(() => {
    loadDecks();
  }, [searchQuery, sortOption])
);

// Navigation
const handleDeckPress = (deck: DeckWithCount) => {
  router.push(`/deck/${deck.id}`);
};

const handleAddPress = () => {
  // Show create deck modal
};
```

**Features:**

- Loading spinner while fetching
- Search filters decks by name
- Sort options in header or picker
- FAB navigates to create deck flow
- Tapping deck navigates to detail screen

**Checkpoint:** Home tab shows deck list with search and sort. Can navigate to deck detail (placeholder).

---

### Phase 4: Create/Edit Deck Modal

Build modal for deck name entry.

**Files to create:**

- `components/decks/DeckFormModal.tsx` - Modal with name input

**DeckFormModal Props:**

```typescript
type DeckFormModalProps = {
  visible: boolean;
  initialName?: string; // For edit mode
  deckId?: number; // For edit mode
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
};
```

**Implementation:**

- TextInput for deck name (max 50 chars)
- Save and Cancel buttons
- Inline validation errors:
  - "Name is required"
  - "A deck with this name already exists"
  - "Cannot use reserved name 'All'"
- Loading state on save button
- Keyboard avoiding view

**Integration with Home screen:**

```typescript
const [modalVisible, setModalVisible] = useState(false);
const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

const handleCreateDeck = async (name: string) => {
  await deckRepository.create(db, name);
  setModalVisible(false);
  loadDecks();
};
```

**Checkpoint:** Can create new decks from Home screen. Validation works correctly.

---

### Phase 5: Deck Detail Screen

Build the screen for viewing and managing deck contents.

**Files to create:**

```
app/deck/
├── _layout.tsx    - Stack layout for deck routes
└── [id].tsx       - Deck detail screen
```

**Screen Features:**

- Header with deck name
- Edit button (opens DeckFormModal for rename)
- Delete button (with confirmation, hidden for "All" deck)
- Item count display
- List of items in deck (reuse ItemCard component)
- Empty state when deck has no items
- FAB to add items

**Delete Confirmation:**

```typescript
Alert.alert("Delete Deck", "Delete this deck? Items will remain in your library.", [
  { text: "Cancel", style: "cancel" },
  { text: "Delete", style: "destructive", onPress: handleDelete },
]);
```

**Remove Item from Deck:**

- Swipe-to-remove gesture OR
- Long-press context menu with "Remove from deck" option
- Confirm removal with brief toast/feedback

**Checkpoint:** Can view deck contents, rename deck, delete deck. Can remove items from deck.

---

### Phase 6: Add Items to Deck

Build the modal/screen for adding items to a deck.

**Files to create:**

- `components/decks/AddItemsModal.tsx` - Multi-select item picker

**AddItemsModal Props:**

```typescript
type AddItemsModalProps = {
  visible: boolean;
  deckId: number;
  onClose: () => void;
  onItemsAdded: () => void;
};
```

**Implementation:**

- Fetch items NOT in this deck via `getItemsNotInDeck()`
- Search bar to filter available items
- Checkbox selection for each item
- "Add Selected (N)" button
- Cancel button
- Loading state during add operation

**Selection State:**

```typescript
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

const toggleItem = (id: number) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

const handleAddSelected = async () => {
  await deckRepository.addItemsToDeck(db, deckId, Array.from(selectedIds));
  onItemsAdded();
  onClose();
};
```

**Checkpoint:** Can add multiple items to a deck. Items appear in deck detail view.

---

### Phase 7: Testing & Polish

Add tests and polish the implementation.

**Tests to create:**

```
db/repositories/__tests__/deckRepository.test.ts
components/decks/__tests__/DeckCard.test.tsx
components/decks/__tests__/DeckList.test.tsx
components/decks/__tests__/DeckFormModal.test.tsx
app/(tabs)/__tests__/index.test.tsx (update existing)
app/deck/__tests__/[id].test.tsx
```

**Test Coverage:**

- Repository: CRUD operations, validation, edge cases
- Components: Rendering, user interactions, callbacks
- Screens: Integration with repository, navigation

**Polish Items:**

- Loading states for all async operations
- Error handling with user-friendly messages
- Keyboard handling (KeyboardAvoidingView)
- Pull-to-refresh on deck list
- Haptic feedback on delete confirmation
- Accessibility labels (accessibilityLabel, accessibilityHint)
- Test IDs on all interactive elements

**Checkpoint:** All tests pass (`pnpm test`), no lint errors (`pnpm lint`).

---

### Key Design Decisions

| Decision              | Choice                  | Rationale                                                       |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| Deck list location    | Home tab                | Decks are primary organization; repurposes underutilized screen |
| Sort implementation   | In-memory               | Dataset small enough; avoids complex SQL                        |
| Create/Edit UI        | Modal                   | Minimal form (just name); modal is quicker than full screen     |
| Remove item UX        | Swipe gesture           | Consistent with iOS patterns; discoverable                      |
| Add items UI          | Modal with multi-select | Efficient for adding many items at once                         |
| "All" deck protection | Hidden delete button    | Prevents accidental deletion of default deck                    |

---

### Final Verification

**Manual testing checklist:**

1. Navigate to Home tab, see deck list
2. Search for deck by name
3. Sort decks by name/date/count
4. Create a new deck with validation
5. Tap deck to see detail view
6. Rename deck from detail view
7. Add items to deck via FAB
8. Remove item from deck (swipe or long-press)
9. Delete deck with confirmation
10. Verify "All" deck cannot be deleted
11. Verify empty states show correctly

**Database verification:**

- After creating deck, verify row in `decks` table
- After adding items, verify rows in `deck_items` table
- After deleting deck, verify `deck_items` cascade deleted
- Verify items remain in `items` table after deck deletion
