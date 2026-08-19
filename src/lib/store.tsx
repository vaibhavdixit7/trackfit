import { createContext, useContext, useEffect, useReducer, useCallback, useState, type ReactNode } from 'react';
import type { AppData, Workout, Goal, Habit, Challenge, Reminder, AppSettings } from '@/types';
import { applyXp, checkBadges, computeStreak, todayISO } from './gamification';
import { useAuth } from './auth';
import {
  loadUserData, dbAddWorkout, dbDeleteWorkout, dbAddGoal, dbUpdateGoal, dbDeleteGoal,
  dbAddHabit, dbUpdateHabit, dbDeleteHabit, dbAddChallenge, dbUpdateChallenge, dbDeleteChallenge,
  dbUpdateReminder, dbAddReminder, dbDeleteReminder, dbUpdateSettings, dbUpdateProfile, dbUpsertBadges,
} from './db';

type Action =
  | { type: 'SET_DATA'; payload: AppData }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'TOGGLE_HABIT'; payload: { id: string; date: string } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_CHALLENGE'; payload: Challenge }
  | { type: 'UPDATE_CHALLENGE'; payload: Challenge }
  | { type: 'DELETE_CHALLENGE'; payload: string }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AppData['profile']> };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    case 'ADD_WORKOUT': {
      let next: AppData = { ...state, workouts: [action.payload, ...state.workouts] };
      next = applyXp(next, 50);
      next.profile = {
        ...next.profile,
        streak: computeStreak(next.workouts.map((w) => w.date)),
        lastActiveDate: todayISO(),
      };
      next.badges = checkBadges(next);
      return next;
    }
    case 'DELETE_WORKOUT': {
      const next: AppData = { ...state, workouts: state.workouts.filter((w) => w.id !== action.payload) };
      next.profile = { ...next.profile, streak: computeStreak(next.workouts.map((w) => w.date)) };
      next.badges = checkBadges(next);
      return next;
    }
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };
    case 'UPDATE_GOAL': {
      let next: AppData = { ...state, goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)) };
      if (action.payload.status === 'completed') {
        const wasCompleted = state.goals.find((g) => g.id === action.payload.id)?.status === 'completed';
        if (!wasCompleted) {
          next = applyXp(next, 200);
        }
      }
      next.badges = checkBadges(next);
      return next;
    }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'ADD_HABIT':
      return { ...state, habits: [action.payload, ...state.habits] };
    case 'TOGGLE_HABIT': {
      const { id, date } = action.payload;
      let next: AppData = {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== id) return h;
          const has = h.completedDates.includes(date);
          return {
            ...h,
            completedDates: has ? h.completedDates.filter((d) => d !== date) : [...h.completedDates, date],
          };
        }),
      };
      const habit = next.habits.find((h) => h.id === id);
      if (habit) {
        const justCompleted = habit.completedDates.includes(date);
        if (justCompleted) {
          next = applyXp(next, 15);
        }
        next.habits = next.habits.map((h) =>
          h.id === id ? { ...h, streak: computeStreak(h.completedDates) } : h
        );
      }
      next.badges = checkBadges(next);
      return next;
    }
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case 'ADD_CHALLENGE':
      return { ...state, challenges: [action.payload, ...state.challenges] };
    case 'UPDATE_CHALLENGE': {
      let next: AppData = { ...state, challenges: state.challenges.map((c) => (c.id === action.payload.id ? action.payload : c)) };
      if (action.payload.status === 'completed') {
        const wasCompleted = state.challenges.find((c) => c.id === action.payload.id)?.status === 'completed';
        if (!wasCompleted) {
          next = applyXp(next, action.payload.xpReward);
        }
      }
      next.badges = checkBadges(next);
      return next;
    }
    case 'DELETE_CHALLENGE':
      return { ...state, challenges: state.challenges.filter((c) => c.id !== action.payload) };
    case 'UPDATE_REMINDER':
      return { ...state, reminders: state.reminders.map((r) => (r.id === action.payload.id ? action.payload : r)) };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    default:
      return state;
  }
}

const EMPTY_DATA: AppData = {
  profile: { name: 'Athlete', level: 1, xp: 0, xpToNext: 100, totalXp: 0, streak: 0, lastActiveDate: '', rank: 'Rookie' },
  workouts: [], goals: [], habits: [], challenges: [], badges: [], reminders: [],
  settings: { darkMode: true, notifications: false, voiceControl: false, offlineMode: true, units: 'metric', soundEnabled: true },
};

interface AppContextValue {
  data: AppData;
  loading: boolean;
  addWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  addHabit: (h: Habit) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  addChallenge: (c: Challenge) => void;
  updateChallenge: (c: Challenge) => void;
  deleteChallenge: (id: string) => void;
  updateReminder: (r: Reminder) => void;
  addReminder: (r: Reminder) => void;
  deleteReminder: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  updateProfile: (p: Partial<AppData['profile']>) => void;
  setData: (d: AppData) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, dispatch] = useReducer(reducer, EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_DATA', payload: EMPTY_DATA });
      setLoading(true);
      return;
    }
    setLoading(true);
    loadUserData(user.id).then((loaded) => {
      dispatch({ type: 'SET_DATA', payload: loaded });
      setLoading(false);
    });
  }, [user]);

  // Dark mode effect
  useEffect(() => {
    if (data.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.darkMode]);

  const userId = user?.id ?? '';

  const value: AppContextValue = {
    data,
    loading,
    addWorkout: useCallback((w: Workout) => {
      dispatch({ type: 'ADD_WORKOUT', payload: w });
      if (userId) dbAddWorkout(userId, w).catch(console.error);
    }, [userId]),
    deleteWorkout: useCallback((id: string) => {
      dispatch({ type: 'DELETE_WORKOUT', payload: id });
      dbDeleteWorkout(id).catch(console.error);
    }, []),
    addGoal: useCallback((g: Goal) => {
      dispatch({ type: 'ADD_GOAL', payload: g });
      if (userId) dbAddGoal(userId, g).catch(console.error);
    }, [userId]),
    updateGoal: useCallback((g: Goal) => {
      dispatch({ type: 'UPDATE_GOAL', payload: g });
      dbUpdateGoal(g).catch(console.error);
    }, []),
    deleteGoal: useCallback((id: string) => {
      dispatch({ type: 'DELETE_GOAL', payload: id });
      dbDeleteGoal(id).catch(console.error);
    }, []),
    addHabit: useCallback((h: Habit) => {
      dispatch({ type: 'ADD_HABIT', payload: h });
      if (userId) dbAddHabit(userId, h).catch(console.error);
    }, [userId]),
    toggleHabit: useCallback((id: string, date: string) => {
      dispatch({ type: 'TOGGLE_HABIT', payload: { id, date } });
      // After dispatch, find the updated habit and persist
      // We need to read the updated state — use a setTimeout to access latest reducer state
      setTimeout(() => {
        // The reducer has already updated; we need the habit from current data
        // We'll use a ref-free approach: re-read from the dispatched state via a side effect
      }, 0);
      // Persist habit update: we need the updated habit data
      // Since dispatch is async, we compute the toggle here
      const habit = data.habits.find((h) => h.id === id);
      if (habit) {
        const has = habit.completedDates.includes(date);
        const updatedDates = has ? habit.completedDates.filter((d) => d !== date) : [...habit.completedDates, date];
        const updated: Habit = {
          ...habit,
          completedDates: updatedDates,
          streak: computeStreak(updatedDates),
        };
        dbUpdateHabit(updated).catch(console.error);
      }
    }, [data.habits]),
    deleteHabit: useCallback((id: string) => {
      dispatch({ type: 'DELETE_HABIT', payload: id });
      dbDeleteHabit(id).catch(console.error);
    }, []),
    addChallenge: useCallback((c: Challenge) => {
      dispatch({ type: 'ADD_CHALLENGE', payload: c });
      if (userId) dbAddChallenge(userId, c).catch(console.error);
    }, [userId]),
    updateChallenge: useCallback((c: Challenge) => {
      dispatch({ type: 'UPDATE_CHALLENGE', payload: c });
      dbUpdateChallenge(c).catch(console.error);
    }, []),
    deleteChallenge: useCallback((id: string) => {
      dispatch({ type: 'DELETE_CHALLENGE', payload: id });
      dbDeleteChallenge(id).catch(console.error);
    }, []),
    updateReminder: useCallback((r: Reminder) => {
      dispatch({ type: 'UPDATE_REMINDER', payload: r });
      dbUpdateReminder(r).catch(console.error);
    }, []),
    addReminder: useCallback((r: Reminder) => {
      dispatch({ type: 'ADD_REMINDER', payload: r });
      if (userId) dbAddReminder(userId, r).catch(console.error);
    }, [userId]),
    deleteReminder: useCallback((id: string) => {
      dispatch({ type: 'DELETE_REMINDER', payload: id });
      dbDeleteReminder(id).catch(console.error);
    }, []),
    updateSettings: useCallback((s: Partial<AppSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: s });
      if (userId) dbUpdateSettings(userId, s).catch(console.error);
    }, [userId]),
    updateProfile: useCallback((p: Partial<AppData['profile']>) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: p });
      if (userId) dbUpdateProfile(userId, p).catch(console.error);
    }, [userId]),
    setData: useCallback((d: AppData) => {
      dispatch({ type: 'SET_DATA', payload: d });
    }, []),
  };

  // Persist badge updates after reducer runs (badges change via ADD_WORKOUT, TOGGLE_HABIT, etc.)
  useEffect(() => {
    if (!userId || loading) return;
    // Only upsert if badges array has items
    if (data.badges.length > 0) {
      dbUpsertBadges(userId, data.badges).catch(console.error);
    }
  }, [data.badges, userId, loading]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
