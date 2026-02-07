import { getDatabase } from './db';
import { scheduleRemindersForNote, cancelRemindersForNote } from './notifications';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  event_name: string | null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<Note>(
    `SELECT * FROM notes ORDER BY updated_at DESC`
  );
  return result;
}

export async function getNote(id: string): Promise<Note | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Note>(`SELECT * FROM notes WHERE id = ?`, [
    id,
  ]);
  return result ?? null;
}

export async function createNote(
  title: string,
  content: string = '',
  event_name: string | null = null
): Promise<Note> {
  const db = await getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO notes (id, title, content, created_at, updated_at, event_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, title, content, now, now, event_name]
  );

  const note = {
    id,
    title,
    content,
    created_at: now,
    updated_at: now,
    event_name,
  };

  // Schedule accountability reminders
  scheduleRemindersForNote(id).catch((error) => {
    console.error('Failed to schedule reminders for note:', error);
  });

  return note;
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
  event_name: string | null = null
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE notes SET title = ?, content = ?, updated_at = ?, event_name = ? WHERE id = ?`,
    [title, content, now, event_name, id]
  );
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDatabase();
  
  // Cancel any pending reminders
  await cancelRemindersForNote(id);
  
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
