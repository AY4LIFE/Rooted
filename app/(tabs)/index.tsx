import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';

import { NoteCard } from '@/components/NoteCard';
import { Text, View, useThemeColor } from '@/components/Themed';
import type { Note } from '@/services/notesDb';
import { getAllNotes } from '@/services/notesDb';

function formatDateForSearch(iso: string): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
  const monthLong = d.toLocaleDateString(undefined, { month: 'long' });
  return `${dateStr} ${monthLong} ${d.getFullYear()} ${d.getDate()}`.toLowerCase();
}

function noteMatchesSearch(note: Note, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const titleMatch = note.title.toLowerCase().includes(q);
  const createdSearch = formatDateForSearch(note.created_at);
  const updatedSearch = formatDateForSearch(note.updated_at);
  const dateMatch = createdSearch.includes(q) || updatedSearch.includes(q);
  return titleMatch || dateMatch;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const accentColor = useThemeColor({}, 'accent');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');

  const filteredNotes = useMemo(
    () => notes.filter((n) => noteMatchesSearch(n, searchQuery)),
    [notes, searchQuery]
  );

  const loadNotes = useCallback(async () => {
    const data = await getAllNotes();
    setNotes(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  }, [loadNotes]);

  const showEmptySearch = searchQuery.trim().length > 0 && filteredNotes.length === 0;
  const showEmptyList = notes.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard note={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notes</Text>
            <Text style={styles.headerSubtitle}>
              Your reflections and sermon notes
            </Text>
            <TextInput
              style={[
                styles.searchInput,
                { color: textColor, backgroundColor: cardBg },
              ]}
              placeholder="Search by title or date..."
              placeholderTextColor={placeholderColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {showEmptySearch ? (
              <>
                <FontAwesome name="search" size={40} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No notes match your search</Text>
                <Text style={styles.emptySubtext}>
                  Try a different title or date
                </Text>
              </>
            ) : showEmptyList ? (
              <>
                <View
                  style={[styles.emptyIconWrap, { backgroundColor: accentColor }]}
                >
                  <FontAwesome name="book" size={32} color="#faf8f5" />
                </View>
                <Text style={styles.emptyText}>No notes yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap + to create your first note
                </Text>
              </>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.7,
  },
  searchInput: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
  },
});
