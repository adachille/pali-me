# Issue 006: Duolingo-Style Lesson Experience

## Overview

Add a structured, Duolingo-style lesson experience for learning Pali progressively through the 32 Pali Primer lessons. Each lesson combines grammar content, vocabulary, and exercises into a guided learning path with linear progression.

## Background

The app currently supports freeform flashcard study (items, decks, spaced repetition) but has no guided learning path. Lesson content from the Pali Primer has been extracted into `docs/pali-lessons/pali-primer-extracted-lesson-content/` with 32 lessons, each containing a `lesson.json` (grammar, tables, examples, exercises) and `vocabulary.tsv`. Exercise TSV files (`exercises.tsv`) will be manually created for each lesson to provide pali/english sentence pairs.

## Goals

- Provide a structured, progressive learning experience
- Integrate lesson content (grammar, tables, examples) as a new content type
- Keep lesson content fully separate from the deck/item system
- Linear progression: users advance through lessons in order

## Key Design Decision: Lessons ≠ Decks

Lesson vocabulary and exercises are **not** stored as items/decks. They are fundamentally different:

- **Lesson content is read-only** — derived from static lesson data, not user-editable
- **Lesson study is quiz-based** — go through all items each time, track % correct, threshold to complete
- **Deck study is spaced repetition** — due-based scheduling, user-managed content

This separation means:
- No auto-created decks cluttering the deck list
- No "if this is a lesson deck, don't allow editing" guard rails
- Lesson study screen is its own self-contained flow
- Decks remain purely user-managed

## Tab Restructure

- **Learn** (new primary tab, replaces Home) — scrollable lesson map
- **My Decks** (renamed from Home) — existing deck list for freeform study
- **Library** — unchanged
- **Settings** — unchanged

## Lesson Map (Learn Tab)

A long scrollable screen showing all 32 lessons as sections. Each lesson section contains nodes:

1. **Learn** — Grammar content (explanations, tables, examples, vocab list)
2. **Vocab Practice** — Quiz on the lesson's vocabulary (dedicated lesson study screen)
3. **Exercise Practice** — Quiz on the lesson's exercises (dedicated lesson study screen)

### Progression Rules

- Lesson 1's Learn node is unlocked by default
- Completing a Learn node unlocks its Vocab Practice + Exercise Practice nodes
- Completing ALL nodes in a lesson unlocks the next lesson's Learn node
- Users can revisit any completed node
- Auto-scrolls to the user's current frontier lesson on load

### Node States

- **Locked** — gray, not tappable
- **Available** — primary green, tappable
- **Completed** — primary with checkmark, tappable (revisit)

## Learn Node Screen

Scrollable content screen with sections:

1. **Vocabulary** (if any) — word list with pali, english, type, gender
2. **Grammar** — explanations as text paragraphs
3. **Tables** — rendered as styled table views
4. **Examples** — Pali/English sentence pairs
5. **"Complete Lesson" button** at bottom

### On Completion

- Mark learn node as completed in `lesson_progress`
- Navigate back to lesson map

## Practice Nodes

Vocab Practice and Exercise Practice navigate to a **dedicated lesson study screen** (`app/lesson-study/[number]`) that:

- Pulls items directly from the static lesson data (no database items)
- Quizzes all items each session
- Tracks % correct
- Marks the practice node as completed when the user reaches the threshold (or completes the session)

## Data Model

### Static Lesson Data

Bundle lesson content as static assets in `data/lessons/`:

- `data/lessons/types.ts` — TypeScript types
- `data/lessons/index.ts` — exports all 32 lessons
- `data/lessons/content/` — lesson JSON files and parsed TSV data

A build script (`scripts/parse-lesson-tsvs.ts`) converts vocabulary.tsv and exercises.tsv into pre-parsed JSON.

### Lesson Progress (Database)

New table `lesson_progress` (schema version 3):

```sql
CREATE TABLE lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_number INTEGER NOT NULL,
  node_type TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  UNIQUE(lesson_number, node_type)
);
```

No `deck_id` — lesson content lives in static data, not the deck system.

## New/Modified Files

| Action | File                                                 |
| ------ | ---------------------------------------------------- |
| New    | `data/lessons/types.ts`                              |
| New    | `data/lessons/index.ts`                              |
| New    | `data/lessons/content/` (lesson JSONs + parsed TSVs) |
| New    | `scripts/parse-lesson-tsvs.ts`                       |
| Modify | `db/schema.ts` (add lesson_progress table)           |
| Modify | `db/types.ts` (add lesson progress types)            |
| Modify | `db/database.ts` (migration v2→v3)                   |
| New    | `db/repositories/lessonRepository.ts`                |
| Modify | `app/(tabs)/_layout.tsx` (4 tabs)                    |
| Modify | `app/(tabs)/index.tsx` (rewrite as lesson map)       |
| New    | `app/(tabs)/my-decks.tsx` (moved deck list)          |
| New    | `app/lesson/_layout.tsx`                             |
| New    | `app/lesson/[number].tsx` (learn screen)             |
| New    | `app/lesson-study/_layout.tsx`                       |
| New    | `app/lesson-study/[number].tsx` (quiz study screen)  |
| New    | `components/lessons/LessonSection.tsx`               |
| New    | `components/lessons/LessonNode.tsx`                  |

## Testing

1. Existing tests still pass
2. Manual flow: Learn tab → Lesson 1 Learn → Complete → practice nodes unlock → quiz vocab/exercises → all nodes done → Lesson 2 unlocks
3. My Decks tab unchanged — only user-created decks
