import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';

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
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const NoteCard = React.memo(function NoteCard({
  note,
  isSelected = false,
  onLongPress,
  onPress,
}: NoteCardProps) {
  const router = useRouter();
  const cardBg = useThemeColor({}, 'card');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const rawText = note.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const preview =
    rawText.length > 120
      ? rawText.slice(0, 120) + '...'
      : rawText;

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
        <RNView
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
            <RNView style={[styles.selectedBadge, { backgroundColor: accentColor }]}>
              <FontAwesome name="check" size={12} color="#faf8f5" />
            </RNView>
          )}

          <RNView style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title || 'Untitled'}
            </Text>
            <Text style={[styles.date, { color: accentColor }]}>{formatDate(note.updated_at)}</Text>
          </RNView>

          {note.event_name ? (
            <RNView style={[styles.eventBadge, { backgroundColor: borderColor }]}>
              <Text style={styles.eventText} numberOfLines={1}>
                {note.event_name}
              </Text>
            </RNView>
          ) : null}

          <Text style={styles.preview} numberOfLines={2}>
            {preview || 'No content'}
          </Text>

          {note.takeaway_verse ? (
            <RNView style={[styles.takeawayRow, { borderTopColor: borderColor }]}>
              <FontAwesome name="bookmark" size={12} color={accentColor} />
              <Text style={[styles.takeawayText, { color: accentColor }]}>
                {note.takeaway_verse}
              </Text>
            </RNView>
          ) : null}
        </RNView>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
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
  selectedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
    marginBottom: 4,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  takeawayText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
});
