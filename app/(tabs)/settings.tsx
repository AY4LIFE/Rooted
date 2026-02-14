import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import type { BibleTranslation } from '@/services/bibleApi';
import { fetchEnglishTranslations } from '@/services/bibleApi';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Switch,
    TextInput,
    View,
} from 'react-native';

import { Text, useThemeColor } from '@/components/Themed';
import {
  getAccountabilityIntervals,
} from '@/services/accountabilitySettings';
import {
  getNotificationPermissionsStatus,
  requestPermissions,
  testNotification,
} from '@/services/notifications';
import { getFocusMode, setFocusMode } from '@/services/focusMode';

export default function SettingsScreen() {
  const router = useRouter();
  const { translationId, translationName, setTranslation } = useTranslation();
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderIntervals, setReminderIntervals] = useState<number[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<{
    granted: boolean;
    canAskAgain: boolean;
  }>({ granted: false, canAskAgain: true });
  const [focusModeEnabled, setFocusModeEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const errorColor = useThemeColor({}, 'error');
  const listRowBg = useThemeColor({}, 'listRow');
  const listRowSelectedBg = useThemeColor({}, 'listRowSelected');
  const accentColor = useThemeColor({}, 'accent');
  const buttonTextColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const searchBorderColor = useThemeColor({}, 'border');
  const searchBgColor = useThemeColor({}, 'card');
  const placeholderColor = useThemeColor({}, 'placeholder');

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

  useFocusEffect(
    useCallback(() => {
      loadReminderSettings();
      getFocusMode().then(setFocusModeEnabled);
    }, [loadReminderSettings])
  );

  const loadReminderSettings = useCallback(async () => {
    try {
      const intervals = await getAccountabilityIntervals();
      setReminderIntervals(intervals);
      const permStatus = await getNotificationPermissionsStatus();
      setNotificationPermission(permStatus);
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermissions();
    if (granted) {
      const permStatus = await getNotificationPermissionsStatus();
      setNotificationPermission(permStatus);
    }
  }, []);

  const handleToggleFocusMode = useCallback(async (value: boolean) => {
    setFocusModeEnabled(value);
    await setFocusMode(value);
  }, []);

  const handleTestNotification = useCallback(async () => {
    if (!notificationPermission.granted) {
      Alert.alert('Permission Required', 'Please enable notifications first');
      return;
    }

    const success = await testNotification();
    if (success) {
      Alert.alert(
        'Test Notification Sent',
        'You should receive a notification in 5 seconds. Make sure your device is not in silent/Do Not Disturb mode.'
      );
    } else {
      Alert.alert('Error', 'Failed to send test notification');
    }
  }, [notificationPermission.granted]);

  const onSelect = useCallback(
    (t: BibleTranslation) => {
      setTranslation(t);
    },
    [setTranslation]
  );

  const filteredTranslations = React.useMemo(() => {
    if (!searchQuery.trim()) return translations;
    const q = searchQuery.toLowerCase();
    return translations.filter((t) => {
      const name = (t.englishName || t.name || '').toLowerCase();
      const short = (t.shortName || t.id || '').toLowerCase();
      return name.includes(q) || short.includes(q) || t.id.toLowerCase().includes(q);
    });
  }, [translations, searchQuery]);

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

  const listHeader = React.useMemo(
    () => (
      <View>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Rooted – Bible Note-Taking</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Mode</Text>
          <Text style={styles.current}>
            Reminds you to silence your phone when opening the app
          </Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {focusModeEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Switch
              value={focusModeEnabled}
              onValueChange={handleToggleFocusMode}
              trackColor={{ false: '#a8a29e', true: accentColor }}
              thumbColor="#faf8f5"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bible translation</Text>
          <Text style={styles.current}>
            Current: {translationName} ({translationId})
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accountability Reminders</Text>
          <Text style={styles.current}>
            Intervals: {reminderIntervals.length > 0
              ? reminderIntervals.map((d) => `${d} day${d !== 1 ? 's' : ''}`).join(', ')
              : 'Not configured'}
          </Text>
          <Link href="/(tabs)/settings/reminders" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.configButton,
                { backgroundColor: accentColor },
                pressed && styles.configButtonPressed,
              ]}
            >
              <Text style={styles.configButtonText}>Configure Intervals</Text>
            </Pressable>
          </Link>
          <View style={styles.permissionSection}>
            <Text style={styles.permissionLabel}>
              Notifications: {notificationPermission.granted ? 'Enabled' : 'Disabled'}
            </Text>
            {!notificationPermission.granted && (
              <Pressable
                style={({ pressed }) => [
                  styles.permissionButton,
                  pressed && styles.permissionButtonPressed,
                ]}
                onPress={handleRequestPermission}
              >
                <Text style={styles.permissionButtonText}>
                  {notificationPermission.canAskAgain
                    ? 'Enable Notifications'
                    : 'Enable in Settings'}
                </Text>
              </Pressable>
            )}
            {notificationPermission.granted && (
              <Pressable
                style={({ pressed }) => [
                  styles.testButton,
                  { backgroundColor: accentColor },
                  pressed && styles.testButtonPressed,
                ]}
                onPress={handleTestNotification}
              >
                <Text style={[styles.testButtonText, { color: buttonTextColor }]}>
                  Test Notification
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {loading && (
          <ActivityIndicator size="large" style={styles.loader} />
        )}
        {error && (
          <Text style={styles.error}>{error}</Text>
        )}
        {!loading && !error && translations.length > 0 && (
          <>
            <Text style={styles.listTitle}>Choose translation</Text>
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: textColor,
                  borderColor: searchBorderColor,
                  backgroundColor: searchBgColor,
                },
              ]}
              placeholder="Search translations (e.g. NKJV, KJV, ESV)"
              placeholderTextColor={placeholderColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </>
        )}
      </View>
    ),
    [
      focusModeEnabled, handleToggleFocusMode, accentColor,
      translationName, translationId, reminderIntervals,
      notificationPermission, handleRequestPermission,
      handleTestNotification, buttonTextColor, loading, error,
      translations.length, searchQuery, textColor, searchBorderColor,
      searchBgColor, placeholderColor,
    ]
  );

  return (
    <FlatList
      style={styles.container}
      data={!loading && !error ? filteredTranslations : []}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.listContent}
      initialNumToRender={20}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.75,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.9,
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
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  searchInput: {
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowPressed: {
    opacity: 0.88,
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
  configButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  configButtonPressed: {
    opacity: 0.85,
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#faf8f5',
  },
  permissionSection: {
    marginTop: 12,
  },
  permissionLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  permissionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  permissionButtonPressed: {
    opacity: 0.7,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  testButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonPressed: {
    opacity: 0.85,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});
