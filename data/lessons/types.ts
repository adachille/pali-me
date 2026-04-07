export type LessonVocabItem = {
  pali: string;
  english: string;
  type: string;
  gender: string;
};

export type LessonExerciseItem = { pali: string; english: string };

export type GrammarTable = { title: string; rows: string[][] };

export type GrammarExample = { pali: string; english: string };

export type LessonGrammar = {
  explanations: string[];
  tables: GrammarTable[];
  examples: GrammarExample[];
};

export type LessonContent = {
  lesson_number: number;
  title: string;
  topic: string;
  grammar: LessonGrammar;
  vocabulary: LessonVocabItem[];
  exercises: LessonExerciseItem[];
};

/**
 * Lesson map node kinds (aligned with lesson_progress.node_type in SQLite).
 */
export type LessonNodeType = "learn" | "vocab_practice" | "exercise_practice";

export type NodeState = "locked" | "available" | "completed";
