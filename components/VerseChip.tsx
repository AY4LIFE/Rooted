import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import type { ParsedVerse } from '@/services/verseParser';

interface VerseChipProps {
  parsed: ParsedVerse;
  onPress: (parsed: ParsedVerse) => void;
}

export const VerseChip = React.memo(function VerseChip({ parsed, onPress }: VerseChipProps) {
  const accentColor = useThemeColor({}, 'accent');
  const bgColor = useThemeColor({}, 'card');

  return (
    <Pressable
      onPress={() => onPress(parsed)}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bgColor },
        pressed && styles.chipPressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
        <FontAwesome name="book" size={10} color="#faf8f5" />
      </View>
      <Text style={[styles.chipText, { color: accentColor }]}>{parsed.raw}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  chipPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
