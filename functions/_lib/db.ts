import { CloudflareEnv } from './types';

let dbInitPromise: Promise<void> | null = null;

export async function ensureD1Tables(env?: CloudflareEnv): Promise<boolean> {
  if (!env || !env.DB) return false;

  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS songs_cache (
            id TEXT PRIMARY KEY,
            title TEXT,
            artist TEXT,
            coverUrl TEXT,
            duration INTEGER,
            source TEXT,
            viewCount INTEGER,
            category TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS sonic_accounts (
            email TEXT PRIMARY KEY,
            uid TEXT NOT NULL,
            username TEXT NOT NULL,
            display_name TEXT NOT NULL,
            photo_url TEXT,
            password_hash TEXT,
            has_manual_password INTEGER DEFAULT 0,
            profile_json TEXT,
            music_data_json TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        `).run();

        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS playlists (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            song_id TEXT NOT NULL,
            song_title TEXT NOT NULL,
            artist TEXT NOT NULL,
            cover_url TEXT NOT NULL,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
      } catch (e) {
        console.warn('D1 schema init error:', e);
      }
    })();
  }

  await dbInitPromise;
  return true;
}
