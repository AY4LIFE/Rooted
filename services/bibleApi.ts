const BIBLE_API_BASE = 'https://bible.helloao.org/api';
const BOLLS_API_BASE = 'https://bolls.life';
export const DEFAULT_TRANSLATION_ID = 'BSB';

// Translations served by Bolls.life instead of helloao
const BOLLS_TRANSLATIONS = ['NKJV'];

export function isBollsTranslation(translationId: string): boolean {
  return BOLLS_TRANSLATIONS.includes(translationId);
}

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

// NKJV translation entry (added manually since it comes from Bolls.life)
const BOLLS_TRANSLATION_ENTRIES: BibleTranslation[] = [
  {
    id: 'NKJV',
    name: 'New King James Version',
    englishName: 'New King James Version',
    shortName: 'NKJV',
    language: 'eng',
    languageEnglishName: 'English',
  },
];

export async function fetchAvailableTranslations(): Promise<BibleTranslation[]> {
  const response = await fetch(`${BIBLE_API_BASE}/available_translations.json`);
  if (!response.ok) throw new Error('Failed to fetch translations');
  const data: AvailableTranslationsResponse = await response.json();
  return data.translations ?? [];
}

/** English translations only, sorted by name; includes Bolls.life translations */
export async function fetchEnglishTranslations(): Promise<BibleTranslation[]> {
  const all = await fetchAvailableTranslations();
  const english = all.filter(
    (t) => t.language === 'eng' || t.languageEnglishName === 'English'
  );

  // Merge in Bolls.life translations (NKJV etc.)
  const merged = [...english, ...BOLLS_TRANSLATION_ENTRIES];

  return merged
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

// ─── Bolls.life helpers ────────────────────────────────────────────

/**
 * Maps USFM book IDs (GEN, EXO …) to the sequential numbers
 * that the Bolls.life API expects (1 = Genesis, 2 = Exodus …).
 */
const USFM_TO_BOLLS_BOOK: Record<string, number> = {
  GEN: 1, EXO: 2, LEV: 3, NUM: 4, DEU: 5,
  JOS: 6, JDG: 7, RUT: 8, '1SA': 9, '2SA': 10,
  '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14, EZR: 15,
  NEH: 16, EST: 17, JOB: 18, PSA: 19, PRO: 20,
  ECC: 21, SNG: 22, ISA: 23, JER: 24, LAM: 25,
  EZK: 26, DAN: 27, HOS: 28, JOL: 29, AMO: 30,
  OBA: 31, JON: 32, MIC: 33, NAH: 34, HAB: 35,
  ZEP: 36, HAG: 37, ZEC: 38, MAL: 39,
  MAT: 40, MRK: 41, LUK: 42, JHN: 43, ACT: 44,
  ROM: 45, '1CO': 46, '2CO': 47, GAL: 48, EPH: 49,
  PHP: 50, COL: 51, '1TH': 52, '2TH': 53,
  '1TI': 54, '2TI': 55, TIT: 56, PHM: 57, HEB: 58,
  JAS: 59, '1PE': 60, '2PE': 61, '1JN': 62, '2JN': 63,
  '3JN': 64, JUD: 65, REV: 66,
};

interface BollsVerse {
  pk: number;
  verse: number;
  text: string;
}

/** Strip simple HTML tags that Bolls.life may include */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Fetch a verse range from Bolls.life API.
 * URL pattern: /get-text/{translation}/{bookNum}/{chapter}/
 * Returns an array of { pk, verse, text }.
 */
async function fetchBollsVerse(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  translation: string
): Promise<string> {
  const bookNum = USFM_TO_BOLLS_BOOK[bookId];
  if (!bookNum) {
    throw new Error(`Unknown book ID for Bolls.life: ${bookId}`);
  }

  const url = `${BOLLS_API_BASE}/get-text/${translation}/${bookNum}/${chapter}/`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch verse from Bolls.life: ${response.status}`);
  }

  const data: BollsVerse[] = await response.json();
  const verses: string[] = [];

  for (const item of data) {
    if (item.verse >= verseStart && item.verse <= verseEnd) {
      verses.push(`${item.verse} ${stripHtml(item.text)}`);
    }
  }

  return verses.join(' ');
}

// ─── Unified fetch ─────────────────────────────────────────────────

export async function fetchVerse(
  bookId: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  translation: string = DEFAULT_TRANSLATION_ID
): Promise<string> {
  // Route to Bolls.life for NKJV (and any future Bolls translations)
  if (isBollsTranslation(translation)) {
    return fetchBollsVerse(bookId, chapter, verseStart, verseEnd, translation);
  }

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
