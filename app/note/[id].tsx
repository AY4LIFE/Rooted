import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { NoteEditor } from '@/components/NoteEditor';
import { Text } from '@/components/Themed';
import { VerseModal } from '@/components/VerseModal';
import { createNote, deleteNote, getNote, updateNote } from '@/services/notesDb';
import type { ParsedVerse } from '@/services/verseParser';

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const noteId = Array.isArray(id) ? id[0] : id;
  const isNew = noteId === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventName, setEventName] = useState('');
  const [verseModal, setVerseModal] = useState<{
    visible: boolean;
    parsed: ParsedVerse | null;
  }>({ visible: false, parsed: null });
  const isSavedRef = useRef(false);
  const initialDataRef = useRef<{ title: string; content: string; eventName: string } | null>(null);

  const loadNote = useCallback(async () => {
    if (isNew) {
      isSavedRef.current = false;
      initialDataRef.current = null;
      return;
    }
    const note = await getNote(noteId!);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setEventName(note.event_name || '');
      initialDataRef.current = {
        title: note.title,
        content: note.content,
        eventName: note.event_name || '',
      };
      isSavedRef.current = true; // Existing note is considered saved
    } else {
      initialDataRef.current = null;
      isSavedRef.current = false;
    }
  }, [noteId, isNew]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const hasUnsavedChanges = useCallback(() => {
    // If we just saved, don't show unsaved changes prompt
    if (isSavedRef.current) return false;
    if (isNew) return title.trim().length > 0 || content.trim().length > 0;
    const initial = initialDataRef.current;
    if (!initial) return false;
    return (
      title !== initial.title ||
      content !== initial.content ||
      eventName !== initial.eventName
    );
  }, [isNew, title, content, eventName]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      if (isNew) {
        const note = await createNote(
          title.trim(),
          content,
          eventName.trim() || null
        );
        // Update initial data before navigation to prevent unsaved changes prompt
        initialDataRef.current = {
          title: title.trim(),
          content,
          eventName: eventName.trim() || '',
        };
        isSavedRef.current = true;
        router.replace(`/note/${note.id}`);
      } else {
        await updateNote(noteId!, title.trim(), content, eventName.trim() || null);
        // Update initial data immediately after save
        initialDataRef.current = { 
          title: title.trim(), 
          content, 
          eventName: eventName.trim() || '' 
        };
        isSavedRef.current = true;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  }, [noteId, isNew, title, content, eventName, router]);

  const handleDelete = useCallback(() => {
    if (isNew) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId!);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  }, [isNew, noteId, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isNew ? 'New Note' : 'Edit Note',
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!isNew && (
            <Pressable onPress={handleDelete} style={{ padding: 8, marginRight: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626' }}>
                Delete
              </Text>
            </Pressable>
          )}
          <Pressable onPress={handleSave} style={{ padding: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>Save</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, handleSave, handleDelete, isNew]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Check if there are unsaved changes
      if (!hasUnsavedChanges()) {
        // No unsaved changes, allow navigation
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Save before leaving?',
        [
          { 
            text: "Don't save", 
            style: 'destructive', 
            onPress: () => {
              // Allow navigation without saving
              navigation.dispatch(e.data.action);
            }
          },
          { 
            text: 'Save', 
            onPress: async () => {
              if (!title.trim()) {
                // No title, can't save - just navigate away
                navigation.dispatch(e.data.action);
                return;
              }
              try {
                if (isNew) {
                  const note = await createNote(title.trim(), content, eventName.trim() || null);
                  // Update initial data to prevent duplicate save prompts
                  initialDataRef.current = { 
                    title: title.trim(), 
                    content, 
                    eventName: eventName.trim() || '' 
                  };
                  isSavedRef.current = true;
                  // Navigate to the saved note, then back
                  router.replace(`/note/${note.id}`);
                  // Small delay to ensure route replacement completes
                  setTimeout(() => {
                    navigation.dispatch(e.data.action);
                  }, 100);
                } else {
                  await updateNote(noteId!, title.trim(), content, eventName.trim() || null);
                  // Update initial data immediately after save
                  initialDataRef.current = { 
                    title: title.trim(), 
                    content, 
                    eventName: eventName.trim() || '' 
                  };
                  isSavedRef.current = true;
                  // Allow navigation after save
                  navigation.dispatch(e.data.action);
                }
              } catch {
                Alert.alert('Error', 'Failed to save note');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, title, content, eventName, isNew, noteId, router]);

  const handleVersePress = (parsed: {
    bookId: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
    raw: string;
  }) => {
    setVerseModal({
      visible: true,
      parsed: {
        book: parsed.raw.split(/\s+\d+:/)[0],
        bookId: parsed.bookId,
        chapter: parsed.chapter,
        verseStart: parsed.verseStart,
        verseEnd: parsed.verseEnd,
        raw: parsed.raw,
      },
    });
  };

  return (
    <>
      <NoteEditor
        title={title}
        content={content}
        eventName={eventName}
        onTitleChange={(value) => {
          setTitle(value);
          isSavedRef.current = false; // Mark as unsaved when content changes
        }}
        onContentChange={(value) => {
          setContent(value);
          isSavedRef.current = false; // Mark as unsaved when content changes
        }}
        onEventNameChange={(value) => {
          setEventName(value);
          isSavedRef.current = false; // Mark as unsaved when content changes
        }}
        onVersePress={handleVersePress}
      />
      <VerseModal
        visible={verseModal.visible}
        parsed={verseModal.parsed}
        onClose={() => setVerseModal({ visible: false, parsed: null })}
      />
    </>
  );
}
