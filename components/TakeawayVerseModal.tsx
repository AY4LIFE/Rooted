import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import { useTranslation } from '@/contexts/TranslationContext';
import { parseVerseReferences } from '@/services/verseParser';
import { getVerseText } from '@/services/verseService';

interface TakeawayVerseModalProps {
  visible: boolean;
  onConfirm: (verseRef: string) => void;
  onSkip?: () => void;
}

export function TakeawayVerseModal({ visible, onConfirm, onSkip }: TakeawayVerseModalProps) {
  const { translationId } = useTranslation();
  const [input, setInput] = useState('');
  const [verseText, setVerseText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const overlayBg = useThemeColor({}, 'overlay');
  const cardBg = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const accentColor = useThemeColor({}, 'accent');
  const buttonTextColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');

  const fetchVerse = useCallback(async (ref: string) => {
    const refs = parseVerseReferences(ref);
    if (refs.length === 0) {
      setVerseText(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { text } = await getVerseText(refs[0].parsed, translationId);
      setVerseText(text);
    } catch {
      setError('Could not fetch verse. Check the reference and try again.');
      setVerseText(null);
    } finally {
      setLoading(false);
    }
  }, [translationId]);

  useEffect(() => {
    if (!input.trim()) {
      setVerseText(null);
      setError(null);
      return;
    }
    const timer = setTimeout(() => fetchVerse(input), 600);
    return () => clearTimeout(timer);
  }, [input, fetchVerse]);

  useEffect(() => {
    if (!visible) {
      setInput('');
      setVerseText(null);
      setError(null);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (input.trim()) {
      onConfirm(input.trim());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.content, { backgroundColor }]}>
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: borderColor }]} />
          </View>

          {/* Header with icon */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: accentColor }]}>
              <FontAwesome name="bookmark" size={20} color="#faf8f5" />
            </View>
            <Text style={styles.title}>Takeaway Verse</Text>
            <Text style={styles.subtitle}>
              What Bible verse are you taking home from this sermon?
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: cardBg, borderColor },
            ]}
            placeholder="e.g. Romans 8:28 or Psalm 23"
            placeholderTextColor={placeholderColor}
            value={input}
            onChangeText={setInput}
            autoFocus
          />

          {loading && <ActivityIndicator size="small" style={styles.loader} />}
          {error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}

          {verseText && !loading && (
            <View style={[styles.verseCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.quoteIcon, { color: accentColor }]}>{'\u201C'}</Text>
              <ScrollView style={styles.verseScroll}>
                <Text style={[styles.verseTextStyle, { color: textColor }]}>{verseText}</Text>
              </ScrollView>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              { backgroundColor: accentColor },
              pressed && styles.pressed,
              (!input.trim() || !verseText) && styles.buttonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!input.trim() || !verseText}
          >
            <FontAwesome name="check" size={16} color={buttonTextColor} style={{ marginRight: 10 }} />
            <Text style={[styles.confirmText, { color: buttonTextColor }]}>
              Save Takeaway
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
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: Dimensions.get('window').height * 0.75,
  },
  handleBar: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 22,
    textAlign: 'center',
  },
  input: {
    fontSize: 17,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 12,
  },
  error: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  verseCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    maxHeight: 160,
  },
  quoteIcon: {
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  verseScroll: {
    maxHeight: 100,
  },
  verseTextStyle: {
    fontSize: 16,
    lineHeight: 26,
  },
  confirmButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
