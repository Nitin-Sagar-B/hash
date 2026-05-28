import { openDB } from 'idb';

const DB_NAME = 'hash-fitness';
const DB_VERSION = 1;

/**
 * Initialize and return the IndexedDB database
 */
function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Daily logs store - keyed by date string (YYYY-MM-DD)
      if (!db.objectStoreNames.contains('dayLogs')) {
        db.createObjectStore('dayLogs', { keyPath: 'date' });
      }

      // Chat history store - auto-increment ID
      if (!db.objectStoreNames.contains('chatHistory')) {
        const chatStore = db.createObjectStore('chatHistory', {
          keyPath: 'id',
          autoIncrement: true
        });
        chatStore.createIndex('date', 'date');
      }

      // Settings store - key-value pairs
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Weight log store - keyed by date
      if (!db.objectStoreNames.contains('weightLog')) {
        db.createObjectStore('weightLog', { keyPath: 'date' });
      }
    }
  });
}

// ==================== Day Logs ====================

export async function saveDayLog(log) {
  const db = await getDB();
  await db.put('dayLogs', log);
}

export async function getDayLog(date) {
  const db = await getDB();
  return db.get('dayLogs', date);
}

export async function getAllDayLogs() {
  const db = await getDB();
  const logs = await db.getAll('dayLogs');
  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

// ==================== Chat History ====================

export async function saveMessage(message) {
  const db = await getDB();
  return db.add('chatHistory', {
    ...message,
    date: message.date || new Date().toISOString().split('T')[0],
    timestamp: message.timestamp || Date.now()
  });
}

export async function getMessages() {
  const db = await getDB();
  const messages = await db.getAll('chatHistory');
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

export async function getMessagesByDate(date) {
  const db = await getDB();
  const messages = await db.getAllFromIndex('chatHistory', 'date', date);
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

export async function clearMessages() {
  const db = await getDB();
  await db.clear('chatHistory');
}

// ==================== Settings ====================

export async function saveSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value;
}

// ==================== Weight Log ====================

export async function saveWeight(date, weightKg) {
  const db = await getDB();
  await db.put('weightLog', { date, weight: weightKg });
}

export async function getWeightHistory() {
  const db = await getDB();
  const entries = await db.getAll('weightLog');
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

// ==================== Helpers ====================

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function createEmptyDayLog(date) {
  return {
    date,
    bodyWeightKg: null,
    caloriesConsumed: 0,
    proteinG: 0,
    fatG: 0,
    carbsG: 0,
    fiberG: 0,
    waterMl: 0,
    steps: 0,
    sleepHrs: 0,
    workoutDone: false,
    workoutDetails: [],
    foodLog: [],
    notes: ''
  };
}

export async function clearAllData() {
  const db = await getDB();
  const tx = db.transaction(['settings', 'dayLogs', 'weightLog', 'chatHistory'], 'readwrite');
  await Promise.all([
    tx.objectStore('settings').clear(),
    tx.objectStore('dayLogs').clear(),
    tx.objectStore('weightLog').clear(),
    tx.objectStore('chatHistory').clear()
  ]);
  await tx.done;
}
