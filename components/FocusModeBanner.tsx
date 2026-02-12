import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';

interface FocusModeBannerProps {
  onPress?: () => void;
}

export function FocusModeBanner({ onPress }: FocusModeBannerProps) {
  const accentColor = useThemeColor({}, 'accent');
  const bgColor = useThemeColor({}, 'listRow');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: bgColor },
        pressed && styles.bannerPressed,
      ]}
      onPress={onPress}
    >
      <FontAwesome
        name="leaf"
        size={13}
        color={accentColor}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: accentColor }]}>
        Focus Mode is on — stay present
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 10,
  },
  bannerPressed: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
});
