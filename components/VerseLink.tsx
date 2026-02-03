import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { verseLinkColorDark, verseLinkColorLight } from '@/constants/Colors';
import type { ParsedVerse } from '@/services/verseParser';

interface VerseLinkProps {
  parsed: ParsedVerse;
  onPress: (parsed: ParsedVerse) => void;
}

export function VerseLink({ parsed, onPress }: VerseLinkProps) {
  const colorScheme = useColorScheme();
  const verseColor =
    colorScheme === 'dark' ? verseLinkColorDark : verseLinkColorLight;

  return (
    <Pressable
      onPress={() => onPress(parsed)}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text
        style={[
          styles.text,
          { color: verseColor, textDecorationLine: 'underline' },
        ]}
      >
        {parsed.raw}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginHorizontal: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
  },
});
