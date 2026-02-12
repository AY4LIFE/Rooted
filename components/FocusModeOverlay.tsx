import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

interface FocusModeOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export function FocusModeOverlay({ visible, onDismiss }: FocusModeOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? 'rgba(28, 25, 23, 0.96)' : 'rgba(250, 248, 245, 0.96)';
  const textColor = isDark ? '#faf8f5' : '#3d3a36';
  const subtextColor = isDark ? 'rgba(250, 248, 245, 0.7)' : 'rgba(61, 58, 54, 0.65)';
  const accentColor = isDark ? '#9caa9c' : '#5a6d5a';
  const iconBgColor = isDark ? 'rgba(156, 170, 156, 0.15)' : 'rgba(90, 109, 90, 0.1)';

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismissOverlay();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismissOverlay = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: bgColor, opacity },
      ]}
    >
      <Pressable style={styles.touchArea} onPress={dismissOverlay}>
        <Animated.View
          style={[
            styles.content,
            { transform: [{ scale }] },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
            <FontAwesome name="leaf" size={36} color={accentColor} />
          </View>

          <Animated.Text style={[styles.title, { color: textColor }]}>
            Time to Focus
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, { color: subtextColor }]}>
            Silence your phone and be present.
          </Animated.Text>

          <Animated.Text style={[styles.verse, { color: accentColor }]}>
            "Be still, and know that I am God."{'\n'}
            <Animated.Text style={[styles.verseRef, { color: subtextColor }]}>
              — Psalm 46:10
            </Animated.Text>
          </Animated.Text>

          <Animated.Text style={[styles.tapHint, { color: subtextColor }]}>
            Tap anywhere to continue
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  touchArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
  },
  verse: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  verseRef: {
    fontSize: 13,
    fontStyle: 'normal',
  },
  tapHint: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
});
