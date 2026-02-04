import { useTranslation } from '@/contexts/TranslationContext';
import type { BibleTranslation } from '@/services/bibleApi';
import { fetchEnglishTranslations } from '@/services/bibleApi';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';

export default function SettingsScreen() {
  const { translationId, translationName, setTranslation } = useTranslation();
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorColor = useThemeColor({}, 'error');
  const listRowBg = useThemeColor({}, 'listRow');
  const listRowSelectedBg = useThemeColor({}, 'listRowSelected');

  const loadTranslations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchEnglishTranslations();
      setTranslations(list);
    } catch (e) {
      setError('Could not load translations. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  const onSelect = useCallback(
    (t: BibleTranslation) => {
      setTranslation(t);
    },
    [setTranslation]
  );

  const renderItem = useCallback(
    ({ item }: { item: BibleTranslation }) => {
      const name = item.englishName || item.name || item.shortName || item.id;
      const isSelected = item.id === translationId;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.row,
            isSelected && styles.rowSelected,
            pressed && styles.rowPressed,
          ]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.rowText, isSelected && styles.rowTextSelected]}>
            {name}
          </Text>
          {item.shortName && item.shortName !== name && (
            <Text style={styles.rowSub}>{item.shortName}</Text>
          )}
        </Pressable>
      );
    },
    [translationId, onSelect, listRowBg, listRowSelectedBg]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Rooted – Bible Note-Taking</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bible translation</Text>
        <Text style={styles.current}>
          Current: {translationName} ({translationId})
        </Text>
      </View>

      {loading && (
        <ActivityIndicator size="large" style={styles.loader} />
      )}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      {!loading && !error && translations.length > 0 && (
        <View style={styles.listWrap}>
          <Text style={styles.listTitle}>Choose translation</Text>
          <FlatList
            data={translations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            initialNumToRender={20}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  current: {
    fontSize: 14,
    opacity: 0.8,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    fontSize: 14,
    marginBottom: 8,
  },
  listWrap: {
    flex: 1,
    minHeight: 200,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowText: {
    fontSize: 16,
  },
  rowTextSelected: {
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
