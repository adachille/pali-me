// Repository for lesson progress tracking

import type { SQLiteDatabase } from "expo-sqlite";
import type { LessonProgressRow, LessonProgress, LessonNodeType } from "../types";
import type { NodeState } from "@/src/data/lessons/types";
import { parseSqliteDate } from "../utils";

// ============================================================================
// Helpers
// ============================================================================

function rowToProgress(row: LessonProgressRow): LessonProgress {
  return {
    id: row.id,
    lessonNumber: row.lesson_number,
    nodeType: row.node_type as LessonNodeType,
    completed: row.completed === 1,
    completedAt: row.completed_at ? parseSqliteDate(row.completed_at) : null,
  };
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetches all lesson progress rows (for map state computation)
 */
export async function getAllProgress(db: SQLiteDatabase): Promise<LessonProgress[]> {
  const rows = await db.getAllAsync<LessonProgressRow>("SELECT * FROM lesson_progress");
  return rows.map(rowToProgress);
}

/**
 * Fetches a single progress row for a lesson number and node type
 */
export async function getProgress(
  db: SQLiteDatabase,
  lessonNumber: number,
  nodeType: LessonNodeType
): Promise<LessonProgress | null> {
  const row = await db.getFirstAsync<LessonProgressRow>(
    "SELECT * FROM lesson_progress WHERE lesson_number = ? AND node_type = ?",
    [lessonNumber, nodeType]
  );
  return row ? rowToProgress(row) : null;
}

// ============================================================================
// Node State Computation (pure function)
// ============================================================================

/**
 * Computes the state (locked/available/completed) of a lesson node.
 *
 * The caller provides the list of prerequisites — this function simply checks
 * whether all of them are completed. This keeps the dependency graph in the
 * caller (which knows the lesson data) rather than encoding it here.
 */
export function getNodeState(
  allProgress: LessonProgress[],
  lessonNumber: number,
  nodeType: LessonNodeType,
  prerequisites: Array<{ lessonNumber: number; nodeType: LessonNodeType }>
): NodeState {
  const isCompleted = (ln: number, nt: string) =>
    allProgress.some((p) => p.lessonNumber === ln && p.nodeType === nt && p.completed);

  if (isCompleted(lessonNumber, nodeType)) return "completed";

  return prerequisites.every((req) => isCompleted(req.lessonNumber, req.nodeType))
    ? "available"
    : "locked";
}

// ============================================================================
// Progress Mutations
// ============================================================================

/**
 * Marks a lesson node as completed (upsert).
 * Used for both learn nodes and practice nodes.
 */
export async function completeNode(
  db: SQLiteDatabase,
  lessonNumber: number,
  nodeType: LessonNodeType
): Promise<void> {
  await db.runAsync(
    `INSERT INTO lesson_progress (lesson_number, node_type, completed, completed_at)
     VALUES (?, ?, 1, datetime('now'))
     ON CONFLICT(lesson_number, node_type)
     DO UPDATE SET completed = 1, completed_at = datetime('now')`,
    [lessonNumber, nodeType]
  );
}
