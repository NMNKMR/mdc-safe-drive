import * as SQLite from "expo-sqlite";

const DB_NAME = "safedrive.db";
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Get the shared database, opening + migrating it on first use. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = open();
  return dbPromise;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  // WAL = faster concurrent reads/writes; FKs on so event cascade-deletes work.
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  await migrate(db);
  return db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS drives (
        id           TEXT PRIMARY KEY NOT NULL,
        started_at   INTEGER NOT NULL,
        ended_at     INTEGER NOT NULL,
        duration_sec INTEGER NOT NULL,
        distance_km  REAL    NOT NULL DEFAULT 0,
        score        INTEGER NOT NULL,
        rating       TEXT    NOT NULL,
        total_events INTEGER NOT NULL DEFAULT 0,
        ai_feedback  TEXT
      );

      CREATE TABLE IF NOT EXISTS events (
        id        TEXT PRIMARY KEY NOT NULL,
        drive_id  TEXT NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
        type      TEXT NOT NULL,
        t         INTEGER NOT NULL,
        value     REAL NOT NULL,
        severity  INTEGER NOT NULL,
        deduction INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_events_drive ON events(drive_id);
      CREATE INDEX IF NOT EXISTS idx_drives_started ON drives(started_at DESC);
    `);
    version = 1;
  }

  // future migrations: if (version < 2) { ...; version = 2; }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
