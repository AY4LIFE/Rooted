import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getAccountabilityIntervals } from './accountabilitySettings';
import { getDatabase } from './db';
import { getNote } from './notesDb';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Check if running in Expo Go (local notifications work, but remote don't)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

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

function generateReminderId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface AccountabilityReminder {
  id: string;
  note_id: string;
  scheduled_for: string;
  reminder_index: number;
  created_at: string;
  triggered_at: string | null;
}

export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && !isExpoGo) {
      // Only set notification channel for development builds
      // Expo Go handles this automatically
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Accountability Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#5a6d5a',
        });
      } catch (error) {
        // Ignore errors in Expo Go - local notifications still work
        console.log('Notification channel setup skipped (Expo Go)');
      }
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

export async function getNotificationPermissionsStatus(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return {
    granted: status === 'granted',
    canAskAgain: canAskAgain ?? true,
  };
}

export async function scheduleRemindersForNote(noteId: string): Promise<void> {
  const intervals = await getAccountabilityIntervals();
  const note = await getNote(noteId);
  if (!note) {
    console.error(`Note ${noteId} not found for scheduling reminders`);
    return;
  }

  const db = await getDatabase();
  const noteCreatedAt = new Date(note.created_at);

  for (let i = 0; i < intervals.length; i++) {
    const days = intervals[i];
    const scheduledFor = new Date(noteCreatedAt);
    scheduledFor.setDate(scheduledFor.getDate() + days);

    // Skip if the date is in the past
    if (scheduledFor <= new Date()) {
      continue;
    }

    const reminderId = generateReminderId();
    try {
      // Local notifications work in Expo Go (remote push notifications don't)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time to Reflect: ${note.title}`,
          body: getRandomQuestion(),
          data: { noteId, type: 'accountability', reminderId },
          sound: true,
        },
        trigger: {
          type: 'date',
          date: scheduledFor,
        },
      });
    } catch (error) {
      // In Expo Go, local notifications should still work despite the warning
      // The warning is about remote push notifications, which we don't use
      console.log('Note: Local notifications may require a development build for full functionality');
      console.error('Failed to schedule notification:', error);
    }

    // Store reminder in database
    await db.runAsync(
      `INSERT INTO accountability_reminders 
       (id, note_id, scheduled_for, reminder_index, created_at, triggered_at)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [
        reminderId,
        noteId,
        scheduledFor.toISOString(),
        i,
        new Date().toISOString(),
      ]
    );
  }
}

export async function cancelRemindersForNote(noteId: string): Promise<void> {
  const db = await getDatabase();
  const reminders = await db.getAllAsync<AccountabilityReminder>(
    `SELECT * FROM accountability_reminders 
     WHERE note_id = ? AND triggered_at IS NULL`,
    [noteId]
  );

  // Mark reminders as triggered (they won't fire if they haven't already)
  for (const reminder of reminders) {
    await db.runAsync(
      `UPDATE accountability_reminders SET triggered_at = ? WHERE id = ?`,
      [new Date().toISOString(), reminder.id]
    );
  }
}

export async function getPendingReminders(): Promise<AccountabilityReminder[]> {
  const db = await getDatabase();
  return await db.getAllAsync<AccountabilityReminder>(
    `SELECT * FROM accountability_reminders 
     WHERE triggered_at IS NULL AND scheduled_for > ? 
     ORDER BY scheduled_for ASC`,
    [new Date().toISOString()]
  );
}

export async function markReminderTriggered(reminderId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE accountability_reminders SET triggered_at = ? WHERE id = ?`,
    [new Date().toISOString(), reminderId]
  );
}

export async function testNotification(): Promise<boolean> {
  try {
    // Schedule a test notification for 5 seconds from now
    const testDate = new Date();
    testDate.setSeconds(testDate.getSeconds() + 5);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'If you see this, notifications are working!',
        data: { type: 'test' },
        sound: true,
      },
      trigger: {
        type: 'date',
        date: testDate,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to schedule test notification:', error);
    return false;
  }
}

export function setupNotificationHandlers(
  onNotificationTap: (noteId: string) => void
): () => void {
  // Handle notification received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = notification.request.content.data as {
        noteId?: string;
        type?: string;
      };
      if (data?.type === 'accountability' && data?.noteId) {
        // Could show an in-app banner here if desired
      }
    }
  );

  // Handle notification tap
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        noteId?: string;
        type?: string;
        reminderId?: string;
      };
      if (data?.type === 'accountability' && data?.noteId) {
        if (data.reminderId) {
          markReminderTriggered(data.reminderId).catch(console.error);
        }
        onNotificationTap(data.noteId);
      }
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
