import { create } from 'zustand';
import {
  saveDayLog, getDayLog, getAllDayLogs,
  saveMessage, getMessages, clearMessages,
  saveSetting, getSetting,
  saveWeight, getWeightHistory,
  getTodayDate, createEmptyDayLog
} from '../lib/db.js';
import { calculateMacros, DEFAULT_PROFILE } from '../lib/nutrition.js';

export const useAppStore = create((set, get) => ({
  // ==================== Auth ====================
  isUnlocked: false,
  unlock: () => set({ isUnlocked: true }),
  lock: () => set({ isUnlocked: false }),

  // ==================== Navigation & Calendar ====================
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  selectedDate: getTodayDate(),
  selectedLog: createEmptyDayLog(getTodayDate()),
  setSelectedDate: async (date) => {
    set({ selectedDate: date });
    const log = await getDayLog(date) || createEmptyDayLog(date);
    set({ selectedLog: log });
  },

  // ==================== User Profile ====================
  userProfile: { ...DEFAULT_PROFILE },
  setUserProfile: async (profile) => {
    set({ userProfile: profile });
    await saveSetting('userProfile', profile);
    // Recalculate macros when weight changes
    const macros = calculateMacros(profile.currentWeight);
    set({ macroGoals: macros });
  },
  updateWeight: async (weightKg) => {
    const profile = { ...get().userProfile, currentWeight: weightKg };
    set({ userProfile: profile });
    await saveSetting('userProfile', profile);
    const macros = calculateMacros(weightKg);
    set({ macroGoals: macros });
    // Also save to weight log
    const today = getTodayDate();
    await saveWeight(today, weightKg);
    // Update today's log
    const todayLog = { ...get().todayLog, bodyWeightKg: weightKg };
    set({ todayLog });
    await saveDayLog(todayLog);
    // Refresh weight history
    const weightHistory = await getWeightHistory();
    set({ weightHistory });
  },

  // ==================== Macro Goals ====================
  macroGoals: calculateMacros(DEFAULT_PROFILE.currentWeight),

  // ==================== Today's Log & Updates ====================
  todayLog: createEmptyDayLog(getTodayDate()),
  updateTodayLog: async (updates) => {
    const current = get().todayLog;
    const updated = { ...current, ...updates };
    set({ todayLog: updated });
    await saveDayLog(updated);
    if (get().selectedDate === getTodayDate()) {
      set({ selectedLog: updated });
    }
  },
  applyDashboardUpdate: async (data) => {
    if (!data?.today) return;
    const current = get().todayLog;
    const t = data.today;
    const updated = {
      ...current,
      caloriesConsumed: t.calories_consumed ?? current.caloriesConsumed,
      proteinG: t.protein_consumed_g ?? current.proteinG,
      fatG: t.fat_consumed_g ?? current.fatG,
      carbsG: t.carbs_consumed_g ?? current.carbsG,
      fiberG: t.fiber_consumed_g ?? current.fiberG,
      waterMl: t.water_consumed_ml ?? current.waterMl,
      steps: t.steps_today ?? current.steps,
      sleepHrs: t.sleep_hrs ?? current.sleepHrs,
      workoutDone: t.workout_done ?? current.workoutDone,
      workoutDetails: t.workout_details ?? current.workoutDetails,
    };
    set({ todayLog: updated });
    await saveDayLog(updated);
    if (get().selectedDate === getTodayDate()) {
      set({ selectedLog: updated });
    }
  },

  // ==================== Chat ====================
  messages: [],
  isStreaming: false,
  addMessage: async (message) => {
    const msg = {
      ...message,
      date: message.date || getTodayDate(),
      timestamp: message.timestamp || Date.now()
    };
    set(state => ({ messages: [...state.messages, msg] }));
    await saveMessage(msg);
    return msg;
  },
  updateLastMessage: (content) => {
    set(state => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content
        };
      }
      return { messages };
    });
  },
  clearChat: async () => {
    await clearMessages();
    set({ messages: [] });
  },
  setStreaming: (streaming) => set({ isStreaming: streaming }),

  // ==================== Log History ====================
  dayLogs: [],
  loadDayLogs: async () => {
    const logs = await getAllDayLogs();
    set({ dayLogs: logs });
  },

  // ==================== Weight History ====================
  weightHistory: [],
  loadWeightHistory: async () => {
    const history = await getWeightHistory();
    set({ weightHistory: history });
  },

  // ==================== Streaks ====================
  streaks: {
    trainingDaysThisWeek: 0,
    proteinGoalHitStreak: 0,
  },
  calculateStreaks: () => {
    const { dayLogs, macroGoals } = get();
    // Training days this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const trainingDaysThisWeek = dayLogs.filter(
      log => log.date >= weekStart && log.workoutDone
    ).length;

    // Protein streak (consecutive days hitting goal)
    let proteinGoalHitStreak = 0;
    const sortedLogs = [...dayLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sortedLogs) {
      if (log.proteinG >= macroGoals.protein * 0.8) {
        proteinGoalHitStreak++;
      } else {
        break;
      }
    }

    set({
      streaks: {
        trainingDaysThisWeek,
        proteinGoalHitStreak,
      }
    });
  },

  // ==================== Hydration ====================
  hydrate: async () => {
    try {
      // Load user profile
      const savedProfile = await getSetting('userProfile');
      if (savedProfile) {
        set({
          userProfile: savedProfile,
          macroGoals: calculateMacros(savedProfile.currentWeight)
        });
      }

      // Load today's log
      const today = getTodayDate();
      const todayLog = await getDayLog(today);
      if (todayLog) {
        set({ todayLog, selectedLog: todayLog });
      } else {
        const newLog = createEmptyDayLog(today);
        set({ todayLog: newLog, selectedLog: newLog });
      }

      // Load chat messages
      const messages = await getMessages();
      set({ messages });

      // Load all day logs
      const dayLogs = await getAllDayLogs();
      set({ dayLogs });

      // Load weight history
      const weightHistory = await getWeightHistory();
      set({ weightHistory });

      // Calculate streaks
      get().calculateStreaks();
    } catch (error) {
      console.error('Failed to hydrate app state:', error);
    }
  }
}));
