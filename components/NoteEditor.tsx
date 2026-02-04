import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import { parseVerseReferences } from '@/services/verseParser';
import { NoteContent } from './NoteContent';

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
  const cardBg = useThemeColor({}, 'card');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <TextInput
          style={[styles.titleInput, { color: textColor }]}
          placeholder="Note title"
          placeholderTextColor={placeholderColor}
          value={title}
          onChangeText={onTitleChange}
        />
        {onEventNameChange && (
          <TextInput
            style={[styles.eventInput, { color: textColor }]}
            placeholder="Event (e.g. Sunday Sermon)"
            placeholderTextColor={placeholderColor}
            value={eventName}
            onChangeText={onEventNameChange}
          />
        )}
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.contentInput, { color: textColor }]}
          placeholder="Take notes... Type Bible references like John 3:16 to make them clickable."
          placeholderTextColor={placeholderColor}
          value={content}
          onChangeText={onContentChange}
          multiline
        />
        {content.length > 0 && parseVerseReferences(content).length > 0 && (
          <>
            <Text style={styles.previewLabel}>Verses (tap to view)</Text>
            <View style={[styles.preview, { backgroundColor: cardBg }]}>
              <NoteContent
                content={content}
                verseOnly
                onVersePress={(parsed) =>
                  onVersePress({
                    bookId: parsed.bookId,
                    chapter: parsed.chapter,
                    verseStart: parsed.verseStart,
                    verseEnd: parsed.verseEnd,
                    raw: parsed.raw,
                  })
                }
              />
            </View>
          </>
        )}
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
    padding: 16,
    paddingBottom: 32,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingVertical: 8,
  },
  eventInput: {
    fontSize: 16,
    marginBottom: 16,
    paddingVertical: 8,
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 120,
    paddingVertical: 12,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  preview: {
    padding: 12,
    borderRadius: 8,
  },
});
