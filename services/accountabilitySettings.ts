import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@rooted/accountability_intervals';
const DEFAULT_INTERVALS = [5]; // Default: 5 days

export interface AccountabilitySettings {
  intervals: number[]; // Array of days after note creation
}

export async function getAccountabilityIntervals(): Promise<number[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((n) => typeof n === 'number' && n >= 1 && n <= 365);
      }
    }
  } catch (error) {
    console.error('Failed to load accountability intervals:', error);
  }
  return DEFAULT_INTERVALS;
}

export async function setAccountabilityIntervals(intervals: number[]): Promise<void> {
  // Validate intervals
  const valid = intervals
    .filter((n) => typeof n === 'number' && n >= 1 && n <= 365)
    .sort((a, b) => a - b)
    .filter((n, i, arr) => arr.indexOf(n) === i); // Remove duplicates

  if (valid.length === 0) {
    throw new Error('At least one valid interval (1-365 days) is required');
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
}
