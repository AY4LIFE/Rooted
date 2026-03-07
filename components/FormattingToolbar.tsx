import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';

interface FormattingToolbarProps {
  onFormat: (marker: string, wrap: boolean) => void;
}

const BUTTONS: { label: string; marker: string; wrap: boolean }[] = [
  { label: 'B', marker: '**', wrap: true },
  { label: 'I', marker: '*', wrap: true },
  { label: 'U', marker: '__', wrap: true },
  { label: 'H1', marker: '# ', wrap: false },
  { label: '\u2022', marker: '- ', wrap: false },
];

export function FormattingToolbar({ onFormat }: FormattingToolbarProps) {
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  return (
    <ScrollView
      horizontal
      scrollEnabled={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={[
        styles.container,
        { borderColor },
      ]}
    >
      {BUTTONS.map((btn) => (
        <Pressable
          key={btn.label}
          onPress={() => onFormat(btn.marker, btn.wrap)}
          style={({ pressed }) => [
            styles.button,
            { borderColor },
            pressed && { backgroundColor: accentColor },
          ]}
        >
          {({ pressed }) => (
            <Text
              style={[
                styles.buttonText,
                { color: pressed ? '#faf8f5' : textColor },
                btn.label === 'B' && styles.bold,
                btn.label === 'I' && styles.italic,
                btn.label === 'U' && styles.underline,
              ]}
            >
              {btn.label}
            </Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 17,
  },
  bold: {
    fontWeight: '900',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
