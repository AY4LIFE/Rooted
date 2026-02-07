import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import { getNote } from '@/services/notesDb';
import type { Note } from '@/services/notesDb';

const ACCOUNTABILITY_QUESTIONS = [
  'What do you plan to change concerning what you have learnt?',
  'How are you going to improve in this area of your life following what you have learnt?',
  'What specific action will you take based on this note?',
  'How has this learning impacted your perspective?',
  'What steps will you take to apply this learning?',
  'How will you grow in this area of your life?',
];

function getRandomQuestion(): string {
  return ACCOUNTABILITY_QUESTIONS[
    Math.floor(Math.random() * ACCOUNTABILITY_QUESTIONS.length)
  ];
}

export default function AccountabilityScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [question] = useState(() => getRandomQuestion());
  const [reflection, setReflection] = useState('');

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const cardBg = useThemeColor({}, 'card');
  const buttonBg = useThemeColor({}, 'accent');
  const buttonTextColor = useThemeColor({}, 'background');

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        router.back();
        return;
      }

      try {
        const loadedNote = await getNote(Array.isArray(noteId) ? noteId[0] : noteId);
        if (!loadedNote) {
          router.back();
          return;
        }
        setNote(loadedNote);
      } catch (error) {
        console.error('Failed to load note:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId, router]);

  const handleDone = () => {
    setReflection('');
    router.back();
  };

  if (loading || !note) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const preview =
    note.content.length > 150
      ? note.content.slice(0, 150) + '...'
      : note.content;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Time to Reflect</Text>
          <Text style={styles.noteTitle}>{note.title}</Text>
          {note.event_name && (
            <Text style={styles.eventName}>{note.event_name}</Text>
          )}
        </View>

        {preview && (
          <View style={[styles.notePreview, { backgroundColor: cardBg }]}>
            <Text style={styles.previewLabel}>Your note:</Text>
            <Text style={styles.previewText}>{preview}</Text>
          </View>
        )}

        <View style={styles.questionSection}>
          <Text style={styles.questionLabel}>Reflection Question</Text>
          <Text style={styles.question}>{question}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your reflection</Text>
          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: cardBg },
            ]}
            placeholder="Take a moment to reflect..."
            placeholderTextColor={placeholderColor}
            value={reflection}
            onChangeText={setReflection}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            { backgroundColor: buttonBg },
            pressed && styles.doneButtonPressed,
          ]}
          onPress={handleDone}
        >
          <Text style={[styles.doneButtonText, { color: buttonTextColor }]}>
            Done
          </Text>
        </Pressable>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventName: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  notePreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  input: {
    minHeight: 150,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },
  doneButtonPressed: {
    opacity: 0.85,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
