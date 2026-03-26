// Main database exports - single import point for all database functionality

// Export migration function
export { migrateDbIfNeeded } from "./database";

// Export all TypeScript types
export type {
  ItemType,
  ItemRow,
  Item,
  ItemInsert,
  StudyDirection,
  StudyStateRow,
  StudyState,
  StudyStateInsert,
  DeckRow,
  Deck,
  DeckInsert,
  DeckItemRow,
  DeckItem,
  LessonNodeType,
  LessonProgressRow,
  LessonProgress,
} from "./types";

// Export schema version and constants
export { SCHEMA_VERSION, DEFAULT_DECK_ID } from "./schema";

// Export repositories
export {
  itemRepository,
  deckRepository,
  studyRepository,
  lessonRepository,
} from "./repositories";

// Export utility functions
export { comparePali, normalizeForSort } from "./utils/sortUtils";

// Re-export useSQLiteContext hook for convenience
export { useSQLiteContext } from "expo-sqlite";
