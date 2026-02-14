import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import type { ParsedVerse } from '@/services/verseParser';
import { splitTextWithVerseRefs } from '@/services/verseParser';

interface NoteContentProps {
  content: string;
  onVersePress: (parsed: ParsedVerse) => void;
  /** When true, only show verse references (for preview section) */
  verseOnly?: boolean;
}

export function NoteContent({ content, onVersePress, verseOnly = false }: NoteContentProps) {
  const colorScheme = useColorScheme();
  const verseColor =
    colorScheme === 'dark' ? Colors.dark.verseLink : Colors.light.verseLink;
  const segments = splitTextWithVerseRefs(content);

  if (verseOnly) {
    const verseSegments = segments.filter((s) => s.type === 'verse' && s.parsed);
    if (verseSegments.length === 0) {
      return (
        <Text style={[styles.text, styles.muted]}>No verses detected</Text>
      );
    }
    return (
      <Text style={styles.text}>
        {verseSegments.map((segment, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Text style={styles.separator}> • </Text>}
            <Text
              style={[styles.verseLink, { color: verseColor }]}
              onPress={() => onVersePress(segment.parsed!)}
            >
              {segment.content}
            </Text>
          </React.Fragment>
        ))}
      </Text>
    );
  }

  return (
    <Text style={styles.text}>
      {segments.map((segment, index) =>
        segment.type === 'text' ? (
          <Text key={index}>{segment.content}</Text>
        ) : (
          segment.parsed && (
            <Pressable
              key={index}
              onPress={() => onVersePress(segment.parsed!)}
              style={({ pressed }) => [styles.versePressable, pressed && styles.versePressed]}
            >
              <Text style={[styles.verseLink, { color: verseColor }]}>
                {segment.content}
              </Text>
            </Pressable>
          )
        )
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  verseLink: {
    textDecorationLine: 'underline',
  },
  separator: {
    opacity: 0.6,
  },
  muted: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
