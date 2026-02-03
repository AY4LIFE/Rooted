import { getDatabase } from './db';

const DEFAULT_TRANSLATION = 'BSB';

function cacheId(
  translation: string,
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number
): string {
  return `${translation}:${bookId}:${chapter}:${verseStart}:${verseEnd}`;
}

export async function getCachedVerse(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  translation: string = DEFAULT_TRANSLATION
): Promise<string | null> {
  const db = await getDatabase();
  const id = cacheId(translation, bookId, chapter, verseStart, verseEnd);

  const result = await db.getFirstAsync<{ text: string }>(
    `SELECT text FROM verse_cache WHERE id = ?`,
    [id]
  );

  return result?.text ?? null;
}

export async function cacheVerse(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  text: string,
  translation: string = DEFAULT_TRANSLATION
): Promise<void> {
  const db = await getDatabase();
  const id = cacheId(translation, bookId, chapter, verseStart, verseEnd);
  const cachedAt = new Date().toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO verse_cache (id, translation, book, chapter, verse_start, verse_end, text, cached_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, translation, bookId, chapter, verseStart, verseEnd, text, cachedAt]
  );
}
