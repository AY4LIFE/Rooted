const BIBLE_API_BASE = 'https://bible.helloao.org/api';
export const DEFAULT_TRANSLATION_ID = 'BSB';

export interface BibleTranslation {
  id: string;
  name: string;
  englishName: string;
  shortName: string;
  language: string;
  languageEnglishName: string;
}

interface AvailableTranslationsResponse {
  translations: BibleTranslation[];
}

export async function fetchAvailableTranslations(): Promise<BibleTranslation[]> {
  const response = await fetch(`${BIBLE_API_BASE}/available_translations.json`);
  if (!response.ok) throw new Error('Failed to fetch translations');
  const data: AvailableTranslationsResponse = await response.json();
  return data.translations ?? [];
}

/** English translations only, sorted by name; max 100 for perf */
export async function fetchEnglishTranslations(): Promise<BibleTranslation[]> {
  const all = await fetchAvailableTranslations();
  return all
    .filter((t) => t.language === 'eng' || t.languageEnglishName === 'English')
    .sort((a, b) => (a.englishName || a.name).localeCompare(b.englishName || b.name))
    .slice(0, 150);
}

interface ChapterContent {
  type: string;
  number?: number;
  content?: (string | { text?: string })[];
}

interface ChapterResponse {
  chapter: {
    content: ChapterContent[];
  };
}

function extractVerseText(content: ChapterContent): string {
  if (!content.content) return '';
  return content.content
    .map((item) => (typeof item === 'string' ? item : item?.text ?? ''))
    .join('');
}

export async function fetchVerse(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  translation: string = DEFAULT_TRANSLATION_ID
): Promise<string> {
  const url = `${BIBLE_API_BASE}/${translation}/${bookId}/${chapter}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch verse: ${response.status}`);
  }

  const data: ChapterResponse = await response.json();
  const verses: string[] = [];

  for (const item of data.chapter.content) {
    if (item.type === 'verse' && item.number !== undefined) {
      const verseNum = item.number;
      if (verseNum >= verseStart && verseNum <= verseEnd) {
        verses.push(`${verseNum} ${extractVerseText(item)}`);
      }
    }
  }

  return verses.join(' ');
}
