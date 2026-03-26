export type {
  LessonContent,
  LessonVocabItem,
  LessonExerciseItem,
  LessonGrammar,
  GrammarTable,
  GrammarExample,
  NodeType,
  NodeState,
} from "./types";

export { LESSONS } from "./content";

import { LESSONS } from "./content";
import type { LessonContent } from "./types";

export const TOTAL_LESSONS = 32;

export function getLessonByNumber(n: number): LessonContent | undefined {
  return LESSONS.find((l) => l.lesson_number === n);
}
