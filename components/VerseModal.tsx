import * as Clipboard from 'expo-clipboard';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
  const cardBg = useThemeColor({}, 'card');
  const errorColor = useThemeColor({}, 'error');
  const buttonSecondaryBg = useThemeColor({}, 'buttonSecondary');
  const buttonSecondaryTextColor = useThemeColor({}, 'buttonSecondaryText');
  const accentColor = useThemeColor({}, 'accent');
  const buttonTextColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

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

  const isFullChapter = parsed.verseStart === 1 && parsed.verseEnd >= 200;
  const reference = isFullChapter
    ? `${parsed.book} ${parsed.chapter}`
    : `${parsed.book} ${parsed.chapter}:${parsed.verseStart}${
        parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ''
      }`;

  const handleCopy = async () => {
    if (!text) return;
    const textToCopy = `${reference}\n${text}`;
    try {
      await Clipboard.setStringAsync(textToCopy);
      Alert.alert('Copied!', 'Verse text has been copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy verse text');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, { backgroundColor }]}>
          {/* Decorative header */}
          <View style={[styles.header, { backgroundColor: cardBg }]}>
            <View style={[styles.headerAccent, { backgroundColor: accentColor }]} />
            <View style={styles.headerBody}>
              <Text style={[styles.quoteIcon, { color: accentColor }]}>{'\u201C'}</Text>
              <View style={styles.headerText}>
                <Text style={styles.reference}>{reference}</Text>
                <Text style={[styles.translation, { color: accentColor }]}>{translationName}</Text>
              </View>
            </View>
          </View>

          {/* Verse body */}
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

          {/* Action buttons */}
          <View style={[styles.buttonRow, { borderTopColor: borderColor }]}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: accentColor },
                pressed && styles.pressed,
                !text && styles.buttonDisabled,
              ]}
              onPress={handleCopy}
              disabled={!text}
            >
              <FontAwesome name="copy" size={16} color={buttonTextColor} style={{ marginRight: 8 }} />
              <Text style={[styles.actionButtonText, { color: buttonTextColor }]}>
                Copy
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: buttonSecondaryBg },
                pressed && styles.pressed,
              ]}
              onPress={onClose}
            >
              <Text style={[styles.actionButtonText, { color: buttonSecondaryTextColor }]}>
                Close
              </Text>
            </Pressable>
          </View>
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
    borderRadius: 20,
    maxWidth: 420,
    width: '100%',
    maxHeight: Dimensions.get('window').height * 0.75,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  headerAccent: {
    width: 5,
  },
  headerBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  quoteIcon: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: '700',
    marginRight: 8,
    marginTop: -6,
  },
  headerText: {
    flex: 1,
    paddingTop: 4,
  },
  reference: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  translation: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  body: {
    minHeight: 80,
    height: 280,
    maxHeight: 320,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    fontSize: 16,
    paddingVertical: 16,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
