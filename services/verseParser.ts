import { getBookId } from '@/constants/bookIds';

export interface ParsedVerse {
  book: string;
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  raw: string;
  isFullChapter?: boolean;
}

/**
 * Regex to match Bible verse references.
 * Matches: John 3:16, 1 John 4:5, 1 Cor 13:4-7, Genesis 1:1, Matthew 1, Genesis 5
 * The :verse part is optional -- when omitted, treated as a full chapter reference.
 */
const VERSE_REF_REGEX =
  /(\d?\s*[A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/g;

export function parseVerseReferences(text: string): Array<{ match: string; parsed: ParsedVerse }> {
  const results: Array<{ match: string; parsed: ParsedVerse }> = [];
  let match: RegExpExecArray | null;

  const regex = new RegExp(VERSE_REF_REGEX.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    const bookPart = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const hasVerse = match[3] !== undefined;
    const verseStart = hasVerse ? parseInt(match[3], 10) : 1;
    const verseEnd = hasVerse
      ? (match[4] ? parseInt(match[4], 10) : verseStart)
      : 200;

    const bookId = getBookId(bookPart);
    if (bookId) {
      results.push({
        match: match[0],
        parsed: {
          book: bookPart,
          bookId,
          chapter,
          verseStart,
          verseEnd,
          raw: match[0],
          isFullChapter: !hasVerse,
        },
      });
    }
  }

  return results;
}

export function splitTextWithVerseRefs(
  text: string
): Array<{ type: 'text' | 'verse'; content: string; parsed?: ParsedVerse }> {
  const segments: Array<{ type: 'text' | 'verse'; content: string; parsed?: ParsedVerse }> = [];
  const refs = parseVerseReferences(text);

  if (refs.length === 0) {
    segments.push({ type: 'text', content: text });
    return segments;
  }

  let lastIndex = 0;
  for (const { match, parsed } of refs) {
    const index = text.indexOf(match, lastIndex);
    if (index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, index) });
    }
    segments.push({ type: 'verse', content: match, parsed });
    lastIndex = index + match.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}
