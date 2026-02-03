import * as SQLite from 'expo-sqlite';

const DB_NAME = 'rooted.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;

  database = await SQLite.openDatabaseAsync(DB_NAME);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      event_name TEXT
    );

    CREATE TABLE IF NOT EXISTS verse_cache (
      id TEXT PRIMARY KEY NOT NULL,
      translation TEXT NOT NULL,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse_start INTEGER NOT NULL,
      verse_end INTEGER NOT NULL,
      text TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_verse_cache_lookup 
    ON verse_cache(translation, book, chapter, verse_start, verse_end);
  `);

  return database;
}
