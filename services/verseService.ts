import { fetchVerse } from './bibleApi';
import { cacheVerse, getCachedVerse } from './verseCache';
import type { ParsedVerse } from './verseParser';

const DEFAULT_TRANSLATION = 'BSB';

export async function getVerseText(
  parsed: ParsedVerse,
  translation: string = DEFAULT_TRANSLATION
): Promise<{ text: string; fromCache: boolean }> {
  const cached = await getCachedVerse(
    parsed.bookId,
    parsed.chapter,
    parsed.verseStart,
    parsed.verseEnd,
    translation
  );

  if (cached) {
    return { text: cached, fromCache: true };
  }

  try {
    const text = await fetchVerse(
      parsed.bookId,
      parsed.chapter,
      parsed.verseStart,
      parsed.verseEnd,
      translation
    );

    await cacheVerse(
      parsed.bookId,
      parsed.chapter,
      parsed.verseStart,
      parsed.verseEnd,
      text,
      translation
    );

    return { text, fromCache: false };
  } catch (error) {
    throw error;
  }
}
