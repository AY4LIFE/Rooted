import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import { useTranslation } from '@/contexts/TranslationContext';
import type { ParsedVerse } from '@/services/verseParser';
import { getVerseText } from '@/services/verseService';

interface VerseModalProps {
  visible: boolean;
  parsed: ParsedVerse | null;
  onClose: () => void;
}

export function VerseModal({ visible, parsed, onClose }: VerseModalProps) {
  const { translationId, translationName } = useTranslation();
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const overlayBg = useThemeColor({}, 'overlay');
  const errorColor = useThemeColor({}, 'error');
  const buttonSecondaryBg = useThemeColor({}, 'buttonSecondary');
  const buttonSecondaryTextColor = useThemeColor({}, 'buttonSecondaryText');

  useEffect(() => {
    if (!visible || !parsed) {
      setText(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    getVerseText(parsed, translationId)
      .then(({ text: verseText }) => {
        if (!cancelled) {
          setText(verseText);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message?.includes('fetch') || err.message?.includes('network')
              ? 'Verse not available offline. Connect to the internet and try again.'
              : 'Failed to load verse.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, parsed, translationId]);

  if (!parsed) return null;

  const reference = `${parsed.book} ${parsed.chapter}:${parsed.verseStart}${
    parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ''
  }`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, { backgroundColor }]}>
          <View style={styles.header}>
            <Text style={styles.reference}>{reference}</Text>
            <Text style={styles.translation}>{translationName}</Text>
          </View>
          <View style={styles.body} pointerEvents="box-none">
            {loading && (
              <ActivityIndicator size="large" style={styles.loader} />
            )}
            {error && (
              <Text style={[styles.error, { color: errorColor }]}>{error}</Text>
            )}
            {text && !loading && (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator
                persistentScrollbar={Platform.OS === 'android'}
                indicatorStyle="default"
                bounces
                nestedScrollEnabled
              >
                <Text style={styles.verseText}>{text}</Text>
              </ScrollView>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: buttonSecondaryBg },
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: buttonSecondaryTextColor }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.75,
  },
  header: {
    marginBottom: 16,
  },
  reference: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
    opacity: 0.7,
  },
  body: {
    minHeight: 80,
    height: 280,
    maxHeight: 320,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    fontSize: 16,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
