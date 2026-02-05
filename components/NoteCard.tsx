import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import type { Note } from '@/services/notesDb';

interface NoteCardProps {
  note: Note;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

export function NoteCard({ note }: NoteCardProps) {
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const preview =
    note.content.length > 100
      ? note.content.slice(0, 100) + '...'
      : note.content;

  return (
    <Link href={`/note/${note.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View
          style={[
            styles.content,
            { backgroundColor: cardBg, borderLeftColor: accentColor },
          ]}
        >
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>
          {note.event_name && (
            <Text style={styles.event} numberOfLines={1}>
              {note.event_name}
            </Text>
          )}
          <Text style={styles.preview} numberOfLines={2}>
            {preview || 'No content'}
          </Text>
          <Text style={styles.date}>{formatDate(note.updated_at)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  content: {
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  event: {
    fontSize: 14,
    opacity: 0.75,
    marginBottom: 6,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
    marginBottom: 10,
  },
  date: {
    fontSize: 13,
    opacity: 0.65,
  },
});
