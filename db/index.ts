// Main database exports - single import point for all database functionality

// Export migration function
export { migrateDbIfNeeded } from './database';

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
} from './types';

// Export schema version
export { SCHEMA_VERSION } from './schema';

// Re-export useSQLiteContext hook for convenience
export { useSQLiteContext } from 'expo-sqlite';
