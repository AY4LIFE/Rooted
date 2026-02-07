import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import type { Note } from '@/services/notesDb';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
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

export function NoteCard({
  note,
  isSelected = false,
  onLongPress,
  onPress,
}: NoteCardProps) {
  const router = useRouter();
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const preview =
    note.content.length > 100
      ? note.content.slice(0, 100) + '...'
      : note.content;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/note/${note.id}`);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
        ]}
        onLongPress={onLongPress}
        onPress={handlePress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: cardBg,
              borderLeftColor: accentColor,
              borderWidth: isSelected ? 2 : 0,
              borderColor: isSelected ? accentColor : 'transparent',
            },
          ]}
        >
          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: accentColor }]}>
              <Text style={styles.selectedIndicatorText}>✓</Text>
            </View>
          )}
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
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    opacity: 0.95,
  },
  content: {
    padding: 18,
    borderRadius: 16,
    borderLeftWidth: 4,
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
