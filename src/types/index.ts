export type ViewKey =
  | 'dashboard'
  | 'workouts'
  | 'goals'
  | 'habits'
  | 'challenges'
  | 'timers'
  | 'analytics'
  | 'calendar'
  | 'badges'
  | 'settings';

export interface Exercise {
  name: string;
  category: string;
  sets: number;
  reps: number;
  weight: number;
  durationMin?: number;
}

export interface Workout {
  id: string;
  date: string; // ISO date
  title: string;
  category: string;
  exercises: Exercise[];
  durationMin: number;
  notes?: string;
  createdAt: number;
}

export type GoalStatus = 'active' | 'completed';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
  createdAt: number;
}

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: HabitFrequency;
  streak: number;
  completedDates: string[]; // ISO dates
  createdAt: number;
}

export type ChallengeStatus = 'active' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  xpReward: number;
  progress: number;
  status: ChallengeStatus;
  startDate: string;
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  rank: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
  days: number[]; // 0-6 (Sun-Sat)
}

export interface AppData {
  profile: UserProfile;
  workouts: Workout[];
  goals: Goal[];
  habits: Habit[];
  challenges: Challenge[];
  badges: Badge[];
  reminders: Reminder[];
  settings: AppSettings;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  voiceControl: boolean;
  offlineMode: boolean;
  units: 'metric' | 'imperial';
  soundEnabled: boolean;
}

export const CATEGORIES = [
  'Strength',
  'Cardio',
  'Flexibility',
  'HIIT',
  'Yoga',
  'Crossfit',
  'Sports',
  'Recovery',
] as const;

export const XP_PER_WORKOUT = 50;
export const XP_PER_HABIT = 15;
export const XP_PER_GOAL_COMPLETE = 200;
export const XP_PER_CHALLENGE_COMPLETE = 300;
