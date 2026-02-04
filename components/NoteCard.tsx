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
  const preview =
    note.content.length > 100
      ? note.content.slice(0, 100) + '...'
      : note.content;

  return (
    <Link href={`/note/${note.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.content, { backgroundColor: cardBg }]}>
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  event: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
});
