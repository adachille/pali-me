# Issue 003: Deck Studying

## Overview

Implement a study mode for practicing flashcards within a deck. Users can test themselves on Pali vocabulary using spaced repetition, with support for bidirectional study (Pali to meaning and meaning to Pali). The feature includes configurable study direction preferences per deck and an optional endless practice mode.

## User Stories

- As a user, I can start a study session for any deck from the Home screen
- As a user, I am presented with flashcards one at a time during a study session
- As a user, I can type my answer and receive immediate feedback
- As a user, I can override the system's judgment and mark my answer as correct
- As a user, I see the correct answer after submitting my response
- As a user, I can configure whether I want to study Pali-first, meaning-first, or random
- As a user, I can enable endless practice mode to ignore intervals and study continuously
- As a user, I see a completion screen when all due cards in a deck have been studied

## UI Requirements

### Home Screen Changes

Update deck cards to include two action icons instead of the current single-tap behavior.

**Current Behavior:**

- Tapping deck card navigates to deck detail screen

**New Behavior:**

- Deck card remains tappable, navigating to deck detail screen
- Two icons on the right side of each deck card:
  - Study icon (dumbbell emoji or play icon) - starts study session
  - Edit icon (pencil emoji or gear icon) - navigates to deck detail

**Deck Card Layout:**

```
┌─────────────────────────────────────────────────────┐
│ [Pin]  Deck Name                         [🏋️] [✏️]  │
│        24 items · Created 3 days ago                │
└─────────────────────────────────────────────────────┘
```

### Study Screen

A focused flashcard study interface.

**Header:**

- Back button (exit study session with confirmation if in progress)
- Deck name
- Progress indicator (e.g., "3 / 12 cards")
- Settings button (gear icon)

**Card Display:**

- Large card showing either Pali text or meaning (based on direction)
- Direction indicator (e.g., "What is the meaning?" or "What is the Pali?")
- Type badge (word, prefix, suffix, etc.)

**Answer Input:**

- Text input field for typing answer
- Submit button
- Keyboard should auto-focus

**Feedback State (after submission):**

- Show user's answer
- Show correct answer
- Visual indicator: green for correct, red for incorrect
- If incorrect: "Mark as Correct" button to override
- "Next Card" button to proceed

**Completion Screen:**

- Congratulatory message (e.g., "Great job! You've completed this study session.")
- Summary stats: cards studied, accuracy percentage
- "Back to Home" button

### Study Settings Modal

Accessible via gear icon in study screen header.

| Setting | Type | Default | Options |
|---------|------|---------|---------|
| Study Direction | Picker | Random | Pali First, Meaning First, Random |
| Endless Mode | Toggle | Off | On/Off |

**Behavior:**

- Direction preference persists per deck
- Endless mode is session-only (resets when leaving study screen)

## Answer Validation

**Normalization:**

1. Convert to lowercase
2. Trim leading/trailing whitespace
3. Replace multiple consecutive whitespace characters with single space

**Comparison:**

- Compare normalized user answer with normalized correct answer
- Exact match = correct
- Non-match = incorrect (but user can override)

## Spaced Repetition Integration

### Card Selection

**Standard Mode (Endless Mode OFF):**

1. Query `study_states` for the deck's items where:
   - `due <= now()` (card is due for review)
   - `suspended = 0` (card is not suspended)
2. Filter by direction based on study settings:
   - Pali First: only `pali_to_meaning` states
   - Meaning First: only `meaning_to_pali` states
   - Random: both directions
3. Order by `due` (oldest first) or shuffle for variety
4. Present cards one at a time

**Endless Mode:**

1. Get all items in deck
2. Generate both directions for each item (or filter by setting)
3. Shuffle the entire list
4. Loop infinitely, reshuffling when all cards shown

### Interval Updates

**On Correct Answer:**

```
if interval = 0:
  interval = 1
else:
  interval = interval * ease
  interval = min(interval, 30)  // Cap at 30 days

due = now() + interval days
```

**On Incorrect Answer:**

```
interval = 0  // Reset to new card status
ease = max(ease - 0.2, 1.3)  // Decrease ease, minimum 1.3
due = now()  // Due immediately
```

**On "Mark as Correct" Override:**

- Same as correct answer logic
- Optionally: slightly smaller ease increase

## Database Changes

### New Columns for Deck Table

Add study direction preference to `decks` table:

```sql
ALTER TABLE decks ADD COLUMN study_direction TEXT DEFAULT 'random';
-- Valid values: 'pali_first', 'meaning_first', 'random'
```

### New Repository Functions

**studyRepository.ts:**

```typescript
// Get due cards for a deck
getDueCardsForDeck(db, deckId, direction?): Promise<StudyCard[]>

// Update study state after review
recordReview(db, studyStateId, correct: boolean): Promise<void>

// Get all cards for endless mode
getAllCardsForDeck(db, deckId, direction?): Promise<StudyCard[]>
```

**deckRepository.ts additions:**

```typescript
// Update study direction preference
updateStudyDirection(db, deckId, direction): Promise<void>

// Get deck with study direction
getByIdWithDirection(db, deckId): Promise<DeckWithDirection | null>
```

## Acceptance Criteria

- [ ] Home screen deck cards have study and edit action icons
- [ ] Tapping study icon navigates to study screen for that deck
- [ ] Study screen displays flashcards one at a time
- [ ] Cards show Pali or meaning based on direction setting
- [ ] User can type answer and submit
- [ ] Correct/incorrect feedback is displayed after submission
- [ ] User can override incorrect answers with "Mark as Correct"
- [ ] Correct answers increase interval, incorrect reset interval
- [ ] Study direction preference persists per deck
- [ ] Endless mode shuffles all cards and loops continuously
- [ ] Completion screen shown when all due cards studied
- [ ] Back button shows confirmation if session in progress
- [ ] All study progress persists to database

## Out of Scope

- Audio pronunciation
- Hints or reveal partial answer
- Study statistics/history tracking beyond current session
- Keyboard shortcuts
- Card animations/flip effects
- Multiple answer formats (typing only for MVP)

## Related Documents

- [DATABASE.md](../DATABASE.md) - Schema reference (study_states table)
- [002-deck-management.md](./002-deck-management.md) - Deck management (prerequisite)
- [PRODUCT_VISION.md](../PRODUCT_VISION.md) - MVP success criteria

## AI Plan

### Summary

Implement deck studying with a flashcard review interface, spaced repetition algorithm, and per-deck study settings. This builds on existing deck and study_states infrastructure.

**Workflow:** After each phase, sync up for manual approval, commit, then proceed to the next phase.

---

### Phase 1: Database & Repository Layer

Add study direction preference to decks and create study repository.

**Files to modify:**

- `db/schema.ts` - Add migration for `study_direction` column
- `db/database.ts` - Add migration logic
- `db/types.ts` - Add `StudyDirection` type for deck preference, `StudyCard` type
- `db/repositories/deckRepository.ts` - Add `updateStudyDirection` function

**Files to create:**

- `db/repositories/studyRepository.ts` - Study card queries and review recording

**StudyCard Type:**

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

**Repository Functions:**

```typescript
// studyRepository.ts
getDueCardsForDeck(db, deckId, direction?): Promise<StudyCard[]>
getAllCardsForDeck(db, deckId, direction?): Promise<StudyCard[]>
recordReview(db, studyStateId, correct: boolean): Promise<void>

// SQL for getDueCardsForDeck:
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
  AND (? IS NULL OR ss.direction = ?)
ORDER BY ss.due ASC
```

**Checkpoint:** Repository functions work correctly. Can query due cards and record reviews.

---

### Phase 2: Home Screen UI Update

Update deck cards to show study and edit action icons.

**Files to modify:**

- `components/decks/DeckCard.tsx` - Add action icons

**DeckCard Props Update:**

```typescript
type DeckCardProps = {
  deck: DeckWithCount;
  onPress: (deck: DeckWithCount) => void;
  onStudyPress: (deck: DeckWithCount) => void;  // New
  onEditPress: (deck: DeckWithCount) => void;   // New
};
```

**Layout Changes:**

- Keep existing card content (name, count, date)
- Add row of icons on right side
- Study icon: dumbbell emoji (🏋️) or custom icon
- Edit icon: pencil emoji (✏️) or custom icon
- Icons should be tappable with appropriate hit areas

**Files to modify:**

- `app/(tabs)/index.tsx` - Update DeckList callbacks

**Navigation Updates:**

```typescript
const handleStudyPress = (deck: DeckWithCount) => {
  router.push(`/study/${deck.id}`);
};

const handleEditPress = (deck: DeckWithCount) => {
  router.push(`/deck/${deck.id}`);
};
```

**Checkpoint:** Deck cards show both icons. Tapping icons triggers navigation (study route may 404 until Phase 4).

---

### Phase 3: Study Screen Components

Build reusable components for the study interface.

**Files to create:**

```
components/study/
├── index.ts              - Barrel exports
├── StudyCard.tsx         - Flashcard display component
├── AnswerInput.tsx       - Text input with submit
├── FeedbackDisplay.tsx   - Correct/incorrect feedback
├── StudyProgress.tsx     - Progress indicator (3/12)
├── StudyCompletion.tsx   - Session complete screen
└── StudySettingsModal.tsx - Direction and endless mode settings
```

**StudyCard Props:**

```typescript
type StudyCardProps = {
  card: StudyCard;
  showAnswer: boolean;  // Whether to reveal the answer side
};
```

**AnswerInput Props:**

```typescript
type AnswerInputProps = {
  onSubmit: (answer: string) => void;
  disabled: boolean;
};
```

**FeedbackDisplay Props:**

```typescript
type FeedbackDisplayProps = {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  onMarkCorrect: () => void;  // Override button
  onNext: () => void;
};
```

**StudySettingsModal Props:**

```typescript
type StudySettingsModalProps = {
  visible: boolean;
  direction: 'pali_first' | 'meaning_first' | 'random';
  endlessMode: boolean;
  onDirectionChange: (direction: string) => void;
  onEndlessModeChange: (enabled: boolean) => void;
  onClose: () => void;
};
```

**Checkpoint:** Components render correctly in isolation.

---

### Phase 4: Study Screen Implementation

Build the main study screen with full functionality.

**Files to create:**

```
app/study/
├── _layout.tsx    - Stack layout for study routes
└── [id].tsx       - Study session screen
```

**Screen State:**

```typescript
const [cards, setCards] = useState<StudyCard[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [userAnswer, setUserAnswer] = useState('');
const [showFeedback, setShowFeedback] = useState(false);
const [isCorrect, setIsCorrect] = useState(false);
const [isComplete, setIsComplete] = useState(false);
const [direction, setDirection] = useState<string>('random');
const [endlessMode, setEndlessMode] = useState(false);
const [settingsVisible, setSettingsVisible] = useState(false);

// Stats for completion screen
const [stats, setStats] = useState({ total: 0, correct: 0 });
```

**Answer Validation:**

```typescript
const normalizeAnswer = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};
```

**Flow:**

1. Load due cards on mount
2. Display current card
3. User types and submits answer
4. Show feedback (correct/incorrect)
5. User taps "Next Card" or "Mark as Correct"
6. Record review to database
7. Advance to next card or show completion

**Back Button Handling:**

```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    if (!showFeedback && currentIndex > 0) {
      e.preventDefault();
      Alert.alert(
        'Leave Study Session?',
        'Your progress will be saved.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) }
        ]
      );
    }
  });
  return unsubscribe;
}, [navigation, showFeedback, currentIndex]);
```

**Endless Mode Logic:**

```typescript
const handleNextCard = async () => {
  // Record review...

  if (endlessMode) {
    // Move to next card, wrap around if at end
    const nextIndex = (currentIndex + 1) % cards.length;
    if (nextIndex === 0) {
      // Reshuffle when looping
      setCards(shuffleArray([...cards]));
    }
    setCurrentIndex(nextIndex);
  } else {
    // Standard mode
    if (currentIndex + 1 >= cards.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  // Reset for next card
  setUserAnswer('');
  setShowFeedback(false);
};
```

**Checkpoint:** Full study session works end-to-end. Cards load, answers validate, progress updates.

---

### Phase 5: Study Settings Persistence

Persist study direction preference per deck.

**Files to modify:**

- `app/study/[id].tsx` - Load and save direction preference

**On Mount:**

```typescript
useEffect(() => {
  const loadDeck = async () => {
    const deck = await deckRepository.getById(db, deckId);
    if (deck) {
      setDirection(deck.studyDirection || 'random');
    }
  };
  loadDeck();
}, [deckId]);
```

**On Direction Change:**

```typescript
const handleDirectionChange = async (newDirection: string) => {
  setDirection(newDirection);
  await deckRepository.updateStudyDirection(db, deckId, newDirection);
  // Reload cards with new direction filter
  await loadCards();
};
```

**Checkpoint:** Direction preference persists across sessions.

---

### Phase 6: Testing & Polish

Add tests and polish the implementation.

**Tests to create:**

```
db/repositories/__tests__/studyRepository.test.ts
components/study/__tests__/StudyCard.test.tsx
components/study/__tests__/AnswerInput.test.tsx
components/study/__tests__/FeedbackDisplay.test.tsx
app/study/__tests__/[id].test.tsx
```

**Test Coverage:**

- Repository: Due card queries, review recording, interval calculations
- Components: Rendering, user interactions
- Answer validation: Normalization edge cases

**E2E Tests (Maestro):**

- `.maestro/04-deck-studying.yaml` - Full study session flow

**Polish Items:**

- Loading states during card fetch
- Haptic feedback on correct/incorrect
- Smooth transitions between cards
- Accessibility labels
- Empty state when no cards due
- Error handling for database operations

**Checkpoint:** All tests pass, no lint errors.

---

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Answer input | Text input (not multiple choice) | More rigorous learning; matches user request |
| Override capability | "Mark as Correct" button | Gives user flexibility for partial matches |
| Interval cap | 30 days max | Prevents cards from disappearing too long |
| Endless mode | Session-only | Keeps default behavior simple |
| Direction preference | Per-deck persistence | Different decks may need different study styles |
| Progress indicator | Simple "3/12" format | Clean, non-distracting |

---

### Final Verification

**Manual testing checklist:**

1. Navigate to Home, see study icons on deck cards
2. Tap study icon, navigate to study screen
3. Card displays with correct direction
4. Type correct answer, see green feedback
5. Type incorrect answer, see red feedback
6. Use "Mark as Correct" override
7. Complete all cards, see completion screen
8. Open settings, change direction
9. Enable endless mode, cards loop continuously
10. Exit mid-session, see confirmation dialog
11. Re-enter deck, direction preference persisted
12. Study deck with no due cards, see empty state

**Database verification:**

- After correct answer: interval increased, due date pushed forward
- After incorrect answer: interval reset to 0, due = now
- Direction preference saved in decks table
