import type { AppData, AppSettings, UserProfile } from '@/types';
import { defaultBadges } from './gamification';

const STORAGE_KEY = 'gym-tracker-data-v1';

export function defaultProfile(): UserProfile {
  return {
    name: 'Athlete',
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalXp: 0,
    streak: 0,
    lastActiveDate: '',
    rank: 'Rookie',
  };
}

export function defaultSettings(): AppSettings {
  return {
    darkMode: true,
    notifications: false,
    voiceControl: false,
    offlineMode: true,
    units: 'metric',
    soundEnabled: true,
  };
}

export function defaultData(): AppData {
  return {
    profile: defaultProfile(),
    workouts: [],
    goals: [],
    habits: [],
    challenges: [],
    badges: defaultBadges(),
    reminders: [
      { id: 'r1', title: 'Morning Workout', time: '06:30', enabled: true, days: [1, 2, 3, 4, 5] },
      { id: 'r2', title: 'Evening Stretch', time: '20:00', enabled: true, days: [1, 2, 3, 4, 5, 6, 0] },
    ],
    settings: defaultSettings(),
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    // Ensure all badge defs exist
    const defaults = defaultData();
    const badgeIds = new Set(parsed.badges.map((b) => b.id));
    defaults.badges.forEach((b) => {
      if (!badgeIds.has(b.id)) parsed.badges.push(b);
    });
    return { ...defaults, ...parsed, badges: parsed.badges };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData;
        resolve(data);
      } catch {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}
