// Database initialization and migration logic

import type { SQLiteDatabase } from "expo-sqlite";
import {
  CREATE_DECKS_TABLE,
  CREATE_DECK_ITEMS_TABLE,
  CREATE_ITEMS_PALI_INDEX,
  CREATE_ITEMS_TABLE,
  CREATE_STUDY_STATES_TABLE,
  INSERT_DEFAULT_DECK,
  MIGRATION_ADD_STUDY_DIRECTION,
  SCHEMA_VERSION,
} from "./schema";

/**
 * Migrates the database to the current schema version
 * Called by SQLiteProvider's onInit callback on app startup
 *
 * @param db - The SQLite database instance
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  try {
    console.log("[DB] Starting database migration check...");

    // Enable foreign key constraints (must be done for each connection)
    await db.execAsync("PRAGMA foreign_keys = ON");
    console.log("[DB] Foreign keys enabled");

    // Enable WAL mode for better concurrency
    await db.execAsync("PRAGMA journal_mode = WAL");
    console.log("[DB] WAL mode enabled");

    // Check current database version
    const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    const currentVersion = result?.user_version ?? 0;

    console.log(`[DB] Current database version: ${currentVersion}`);
    console.log(`[DB] Target schema version: ${SCHEMA_VERSION}`);

    // Run migrations if needed
    if (currentVersion < SCHEMA_VERSION) {
      await runMigrations(db, currentVersion);
    } else {
      console.log("[DB] Database is up to date, no migration needed");
    }

    console.log("[DB] Database initialization complete");
  } catch (error) {
    console.error("[DB] Migration failed:", error);
    throw error; // Prevent app from loading with broken database
  }
}

/**
 * Runs all necessary migrations from current version to target version
 *
 * @param db - The SQLite database instance
 * @param currentVersion - The current database version
 */
async function runMigrations(db: SQLiteDatabase, currentVersion: number): Promise<void> {
  let version = currentVersion;

  // Migration from version 0 (empty database) to version 1
  if (version === 0) {
    console.log("[DB] Running migration 0 -> 1: Initial schema");

    await db.execAsync(`
      ${CREATE_ITEMS_TABLE};
      ${CREATE_ITEMS_PALI_INDEX};
      ${CREATE_STUDY_STATES_TABLE};
      ${CREATE_DECKS_TABLE};
      ${CREATE_DECK_ITEMS_TABLE};
      ${INSERT_DEFAULT_DECK};
    `);

    version = 1;
    console.log("[DB] Migration 0 -> 1 completed");
  }

  // Migration from version 1 to version 2: Add study_direction to decks
  if (version === 1) {
    console.log("[DB] Running migration 1 -> 2: Add study_direction column");
    await db.execAsync(MIGRATION_ADD_STUDY_DIRECTION);
    version = 2;
    console.log("[DB] Migration 1 -> 2 completed");
  }

  // Update the database version
  await db.execAsync(`PRAGMA user_version = ${version}`);
  console.log(`[DB] Database version updated to ${version}`);
}
