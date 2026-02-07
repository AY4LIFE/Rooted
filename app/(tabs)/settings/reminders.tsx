import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import {
  getAccountabilityIntervals,
  setAccountabilityIntervals,
} from '@/services/accountabilitySettings';

export default function RemindersConfigScreen() {
  const router = useRouter();
  const [intervals, setIntervals] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInterval, setNewInterval] = useState('');

  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const cardBg = useThemeColor({}, 'card');
  const listRowBg = useThemeColor({}, 'listRow');
  const accentColor = useThemeColor({}, 'accent');
  const buttonTextColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadIntervals();
  }, []);

  const loadIntervals = async () => {
    try {
      const loaded = await getAccountabilityIntervals();
      setIntervals(loaded);
    } catch (error) {
      console.error('Failed to load intervals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (intervals.length === 0) {
      Alert.alert('Error', 'At least one reminder interval is required');
      return;
    }

    try {
      await setAccountabilityIntervals(intervals);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder intervals');
    }
  }, [intervals, router]);

  const handleAdd = useCallback(() => {
    const days = parseInt(newInterval.trim(), 10);
    if (isNaN(days) || days < 1 || days > 365) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 365');
      return;
    }

    if (intervals.includes(days)) {
      Alert.alert('Duplicate', 'This interval already exists');
      return;
    }

    const updated = [...intervals, days].sort((a, b) => a - b);
    setIntervals(updated);
    setNewInterval('');
  }, [newInterval, intervals]);

  const handleRemove = useCallback(
    (index: number) => {
      const updated = intervals.filter((_, i) => i !== index);
      setIntervals(updated);
    },
    [intervals]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminder Intervals</Text>
        <Text style={styles.subtitle}>
          Set when you want to be reminded to reflect on your notes (in days
          after note creation)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Intervals</Text>
        {intervals.length === 0 ? (
          <Text style={styles.emptyText}>No intervals configured</Text>
        ) : (
          intervals.map((days, index) => (
            <View
              key={index}
              style={[styles.intervalRow, { backgroundColor: listRowBg }]}
            >
              <Text style={styles.intervalText}>{days} day{days !== 1 ? 's' : ''}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.removeButtonPressed,
                ]}
                onPress={() => handleRemove(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Interval</Text>
        <View style={styles.addRow}>
          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: cardBg },
            ]}
            placeholder="Days (1-365)"
            placeholderTextColor={placeholderColor}
            value={newInterval}
            onChangeText={setNewInterval}
            keyboardType="numeric"
          />
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: accentColor, marginLeft: 12 },
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAdd}
          >
            <Text style={[styles.addButtonText, { color: buttonTextColor }]}>
              Add
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: accentColor },
          pressed && styles.saveButtonPressed,
        ]}
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: buttonTextColor }]}>
          Save
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
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
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.9,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  intervalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  intervalText: {
    fontSize: 16,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
