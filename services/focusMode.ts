import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@rooted/focus_mode';

export async function getFocusMode(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch (error) {
    console.error('Failed to load focus mode setting:', error);
  }
  // Default: enabled
  return true;
}

export async function setFocusMode(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to save focus mode setting:', error);
  }
}
