import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import { FormattingToolbar } from './FormattingToolbar';
import { VerseChip } from './VerseChip';
import { parseVerseReferences } from '@/services/verseParser';

interface NoteEditorProps {
  title: string;
  content: string;
  eventName?: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onEventNameChange?: (eventName: string) => void;
  onVersePress: (parsed: { bookId: string; chapter: number; verseStart: number; verseEnd: number; raw: string }) => void;
}

export function NoteEditor({
  title,
  content,
  eventName = '',
  onTitleChange,
  onContentChange,
  onEventNameChange,
  onVersePress,
}: NoteEditorProps) {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const { height: windowHeight } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const contentInputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const isFocusedRef = useRef(false);

  const [debouncedContent, setDebouncedContent] = useState(content);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 500);
    return () => clearTimeout(timer);
  }, [content]);

  const detectedVerses = useMemo(
    () => parseVerseReferences(debouncedContent),
    [debouncedContent]
  );

  // Guard selection updates: when the TextInput blurs (user taps toolbar),
  // the system fires onSelectionChange with {0,0}. Without this guard the
  // real cursor position is erased and formatting is inserted at position 0.
  const handleSelectionChange = useCallback((e: any) => {
    if (isFocusedRef.current) {
      selectionRef.current = e.nativeEvent.selection;
    }
  }, []);

  const handleFormat = useCallback((marker: string, wrap: boolean) => {
    const { start, end } = selectionRef.current;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);

    let newContent: string;

    if (wrap) {
      newContent = before + marker + (selected || 'text') + marker + after;
    } else {
      const lineStart = content.lastIndexOf('\n', start - 1) + 1;
      const beforeLine = content.slice(0, lineStart);
      const restOfContent = content.slice(lineStart);
      newContent = beforeLine + marker + restOfContent;
    }

    onContentChange(newContent);
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 60);
  }, [content, onContentChange]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    return () => sub.remove();
  }, []);

  const keyboardOffset = Platform.OS === 'ios' ? Math.min(windowHeight * 0.12, 100) : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardOffset}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        scrollEventThrottle={16}
      >
        {/* ---- Title ---- */}
        <TextInput
          style={[styles.titleInput, { color: textColor, borderBottomColor: borderColor }]}
          placeholder="Title"
          placeholderTextColor={placeholderColor}
          value={title}
          onChangeText={onTitleChange}
        />

        {/* ---- Event Name ---- */}
        {onEventNameChange && (
          <TextInput
            style={[styles.eventInput, { color: textColor, borderBottomColor: borderColor }]}
            placeholder="Event / Service name"
            placeholderTextColor={placeholderColor}
            value={eventName}
            onChangeText={onEventNameChange}
          />
        )}

        {/* ---- Verse Chips ---- */}
        {detectedVerses.length > 0 && (
          <View style={styles.verseSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.verseBarContent}
              keyboardShouldPersistTaps="always"
            >
              {detectedVerses.map(({ parsed }, index) => (
                <VerseChip
                  key={parsed.raw + index}
                  parsed={parsed}
                  onPress={(p) =>
                    onVersePress({
                      bookId: p.bookId,
                      chapter: p.chapter,
                      verseStart: p.verseStart,
                      verseEnd: p.verseEnd,
                      raw: p.raw,
                    })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---- Formatting Toolbar ---- */}
        <View style={styles.toolbarWrap}>
          <FormattingToolbar onFormat={handleFormat} />
        </View>

        {/* ---- Content ---- */}
        <TextInput
          ref={contentInputRef}
          style={[styles.contentInput, { color: textColor }]}
          placeholder={'Start writing your notes here...\n\nType Bible references like John 3:16 or Matthew 1 to make them tappable.'}
          placeholderTextColor={placeholderColor}
          value={content}
          onChangeText={onContentChange}
          onSelectionChange={handleSelectionChange}
          onFocus={() => { isFocusedRef.current = true; }}
          onBlur={() => { isFocusedRef.current = false; }}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />

        <View style={{ height: 220 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    marginBottom: 6,
  },
  eventInput: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
    opacity: 0.8,
  },
  verseSection: {
    marginTop: 14,
    marginBottom: 6,
  },
  verseBarContent: {
    alignItems: 'center',
    paddingRight: 8,
  },
  toolbarWrap: {
    marginVertical: 14,
    alignItems: 'center',
  },
  contentInput: {
    fontSize: 17,
    lineHeight: 30,
    paddingVertical: 4,
    minHeight: 200,
  },
});
