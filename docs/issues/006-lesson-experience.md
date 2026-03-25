# Issue 006: Duolingo-Style Lesson Experience

## Overview

Add a structured, Duolingo-style lesson experience for learning Pali progressively through the 32 Pali Primer lessons. Each lesson combines grammar content, vocabulary, and exercises into a guided learning path with linear progression.

## Background

The app currently supports freeform flashcard study (items, decks, spaced repetition) but has no guided learning path. Lesson content from the Pali Primer has been extracted into `docs/pali-lessons/pali-primer-extracted-lesson-content/` with 32 lessons, each containing a `lesson.json` (grammar, tables, examples, exercises) and `vocabulary.tsv`. Exercise TSV files (`exercises.tsv`) will be manually created for each lesson to provide pali/english sentence pairs.

## Goals

- Provide a structured, progressive learning experience
- Integrate lesson content (grammar, tables, examples) as a new content type
- Auto-create vocab and exercise decks from lesson data
- Reuse the existing study flow for practice nodes
- Linear progression: users advance through lessons in order

## Tab Restructure

- **Learn** (new primary tab, replaces Home) — scrollable lesson map
- **Practice** (renamed from Home) — existing deck list for freeform study
- **Library** — unchanged
- **Settings** — unchanged

## Lesson Map (Learn Tab)

A long scrollable screen showing all 32 lessons as sections. Each lesson section contains nodes:

1. **Learn** — Grammar content (explanations, tables, examples, vocab list)
2. **Vocab Practice** — Study the lesson's vocabulary via existing study UX
3. **Exercise Practice** — Study the lesson's exercises via existing study UX

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

- Create vocab deck "Pali Primer - Lesson N Vocab" with items from `vocabulary.tsv` (if vocab exists)
- Create exercise deck "Pali Primer - Lesson N Exercises" with items from `exercises.tsv` (if exercises exist)
- Mark learn node as completed
- Navigate back to lesson map

## Practice Nodes

Both Vocab Practice and Exercise Practice navigate to `app/study/[id]` with the auto-created deck ID. No new screens needed — the existing study flow handles everything.

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
  node_type TEXT NOT NULL CHECK(node_type IN ('learn', 'vocab_practice', 'exercise_practice')),
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  deck_id INTEGER,
  UNIQUE(lesson_number, node_type)
);
```

### Item Type Mapping

TSV vocab types map to existing ItemType:

- `noun` / `verb` / `adjective` → `"word"`
- `indeclinable` → `"particle"`

Gender from TSV stored in the `notes` field (e.g., `"Gender: m"`).

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
| New    | `app/(tabs)/practice.tsx` (moved deck list)          |
| New    | `app/lesson/_layout.tsx`                             |
| New    | `app/lesson/[number].tsx` (learn screen)             |
| New    | `components/lessons/LessonSection.tsx`               |
| New    | `components/lessons/LessonNode.tsx`                  |

## Testing

1. Existing tests still pass
2. Manual flow: Learn tab → Lesson 1 Learn → Complete → practice nodes unlock → study vocab/exercises → all nodes done → Lesson 2 unlocks
3. Practice tab shows auto-created decks
