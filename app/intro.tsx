import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function IntroScreen() {
  const accent = useThemeColor({}, 'accent');
  const colorScheme = useColorScheme();
  const buttonTextColor = colorScheme === 'dark' ? '#faf8f5' : '#111827';

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={[styles.badge, { borderColor: accent }]}>
          <View style={[styles.badgeInner, { backgroundColor: accent }]} />
        </View>

        <Text style={styles.title}>Rooted</Text>
        <Text style={styles.subtitle}>Your Bible Note-Taking Companion</Text>

        <Text style={styles.verse}>
          “...being rooted and grounded in love.”{'\n'}
          <Text style={styles.verseRef}>Ephesians 3:17</Text>
        </Text>

        <Link href="/(tabs)" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: accent },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, { color: buttonTextColor }]}>
              Enter notes
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  badgeInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 28,
    textAlign: 'center',
  },
  verse: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  verseRef: {
    fontStyle: 'normal',
    fontWeight: '500',
  },
  button: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

