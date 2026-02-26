// Repository for study session operations

import type { SQLiteDatabase } from "expo-sqlite";
import type {
  DeckStudyDirection,
  ItemType,
  StudyCard,
  StudyCardRow,
  StudyDirection,
} from "../types";
import { parseSqliteDate } from "../utils";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Converts a raw study card row to an application-level StudyCard
 */
function rowToStudyCard(row: StudyCardRow): StudyCard {
  return {
    studyStateId: row.study_state_id,
    itemId: row.item_id,
    direction: row.direction as StudyDirection,
    pali: row.pali,
    meaning: row.meaning,
    type: row.type as ItemType,
    interval: row.interval,
    ease: row.ease,
    due: parseSqliteDate(row.due),
  };
}

/**
 * Maps deck study direction preference to study state direction filter
 */
function getDirectionFilter(deckDirection: DeckStudyDirection): StudyDirection | null {
  switch (deckDirection) {
    case "pali_first":
      return "pali_to_meaning";
    case "meaning_first":
      return "meaning_to_pali";
    case "random":
      return null; // No filter, include both directions
  }
}

// ============================================================================
// Study Card Queries
// ============================================================================

/**
 * Gets all due cards for a deck (cards where due <= now and not suspended)
 *
 * @param db - SQLite database instance
 * @param deckId - Deck ID to get cards for
 * @param direction - Optional direction preference to filter by
 * @returns Array of study cards in random order
 */
export async function getDueCardsForDeck(
  db: SQLiteDatabase,
  deckId: number,
  direction: DeckStudyDirection = "random"
): Promise<StudyCard[]> {
  const directionFilter = getDirectionFilter(direction);

  const rows = await db.getAllAsync<StudyCardRow>(
    `SELECT
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
    ORDER BY RANDOM()`,
    [deckId, directionFilter, directionFilter]
  );

  return rows.map(rowToStudyCard);
}

/**
 * Gets all cards for a deck (for endless mode, ignores due date)
 *
 * @param db - SQLite database instance
 * @param deckId - Deck ID to get cards for
 * @param direction - Optional direction preference to filter by
 * @returns Array of study cards (not filtered by due date)
 */
export async function getAllCardsForDeck(
  db: SQLiteDatabase,
  deckId: number,
  direction: DeckStudyDirection = "random"
): Promise<StudyCard[]> {
  const directionFilter = getDirectionFilter(direction);

  const rows = await db.getAllAsync<StudyCardRow>(
    `SELECT
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
      AND ss.suspended = 0
      AND (? IS NULL OR ss.direction = ?)
    ORDER BY RANDOM()`,
    [deckId, directionFilter, directionFilter]
  );

  return rows.map(rowToStudyCard);
}

// ============================================================================
// Review Recording
// ============================================================================

/**
 * Records a review result and updates the study state
 *
 * Interval calculation:
 * - Correct: new_interval = interval * ease (or 1 if interval is 0), capped at 30 days
 * - Incorrect: interval = 0, ease decreased by 0.2 (min 1.3)
 *
 * @param db - SQLite database instance
 * @param studyStateId - Study state ID to update
 * @param correct - Whether the answer was correct
 */
export async function recordReview(
  db: SQLiteDatabase,
  studyStateId: number,
  correct: boolean
): Promise<void> {
  if (correct) {
    // Correct answer: increase interval using CTE to calculate new_interval once
    await db.runAsync(
      `WITH new_values AS (
         SELECT MIN(
           CASE WHEN interval = 0 THEN 1 ELSE CAST(interval * ease AS INTEGER) END,
           30
         ) AS new_interval
         FROM study_states
         WHERE id = ?
       )
       UPDATE study_states
       SET
         interval = (SELECT new_interval FROM new_values),
         due = datetime('now', '+' || (SELECT new_interval FROM new_values) || ' days')
       WHERE id = ?`,
      [studyStateId, studyStateId]
    );
  } else {
    // Incorrect answer: reset interval, decrease ease
    await db.runAsync(
      `UPDATE study_states
       SET
         interval = 0,
         ease = MAX(ease - 0.2, 1.3),
         due = datetime('now')
       WHERE id = ?`,
      [studyStateId]
    );
  }
}
