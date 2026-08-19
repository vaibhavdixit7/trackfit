import { supabase } from './supabase';
import { defaultBadges } from './gamification';
import type {
  AppData, Workout, Goal, Habit, Challenge, Badge, Reminder, AppSettings, UserProfile,
} from '@/types';

// ============ Type mappers (DB snake_case <-> app camelCase) ============

interface WorkoutRow {
  id: string;
  user_id: string;
  date: string;
  title: string;
  category: string;
  exercises: any[];
  duration_min: number;
  notes: string | null;
  created_at: number;
}

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: string;
  created_at: number;
}

interface HabitRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  frequency: string;
  streak: number;
  completed_dates: string[];
  created_at: number;
}

interface ChallengeRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  duration_days: number;
  xp_reward: number;
  progress: number;
  status: string;
  start_date: string;
  created_at: number;
}

interface BadgeRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  unlocked: boolean;
  unlocked_at: number | null;
}

interface ReminderRow {
  id: string;
  user_id: string;
  title: string;
  time: string;
  enabled: boolean;
  days: number[];
}

interface ProfileRow {
  id: string;
  name: string;
  level: number;
  xp: number;
  xp_to_next: number;
  total_xp: number;
  streak: number;
  last_active_date: string;
  rank: string;
}

interface SettingsRow {
  id: string;
  dark_mode: boolean;
  notifications: boolean;
  voice_control: boolean;
  offline_mode: boolean;
  units: string;
  sound_enabled: boolean;
}

// ============ Mappers ============

function mapWorkout(r: WorkoutRow): Workout {
  return {
    id: r.id,
    date: r.date,
    title: r.title,
    category: r.category,
    exercises: r.exercises ?? [],
    durationMin: r.duration_min,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function mapGoal(r: GoalRow): Goal {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    target: r.target,
    current: r.current,
    unit: r.unit,
    deadline: r.deadline,
    status: r.status as Goal['status'],
    createdAt: r.created_at,
  };
}

function mapHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    frequency: r.frequency as Habit['frequency'],
    streak: r.streak,
    completedDates: r.completed_dates ?? [],
    createdAt: r.created_at,
  };
}

function mapChallenge(r: ChallengeRow): Challenge {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    durationDays: r.duration_days,
    xpReward: r.xp_reward,
    progress: r.progress,
    status: r.status as Challenge['status'],
    startDate: r.start_date,
    createdAt: r.created_at,
  };
}

function mapBadge(r: BadgeRow): Badge {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    icon: r.icon,
    tier: r.tier as Badge['tier'],
    unlocked: r.unlocked,
    unlockedAt: r.unlocked_at ?? undefined,
  };
}

function mapReminder(r: ReminderRow): Reminder {
  return {
    id: r.id,
    title: r.title,
    time: r.time,
    enabled: r.enabled,
    days: r.days ?? [],
  };
}

function mapProfile(r: ProfileRow): UserProfile {
  return {
    name: r.name,
    level: r.level,
    xp: r.xp,
    xpToNext: r.xp_to_next,
    totalXp: r.total_xp,
    streak: r.streak,
    lastActiveDate: r.last_active_date,
    rank: r.rank,
  };
}

function mapSettings(r: SettingsRow): AppSettings {
  return {
    darkMode: r.dark_mode,
    notifications: r.notifications,
    voiceControl: r.voice_control,
    offlineMode: r.offline_mode,
    units: r.units as AppSettings['units'],
    soundEnabled: r.sound_enabled,
  };
}

// ============ Load all data ============

export async function loadUserData(userId: string): Promise<AppData> {
  const [workoutsRes, goalsRes, habitsRes, challengesRes, badgesRes, remindersRes, profileRes, settingsRes] =
    await Promise.all([
      supabase.from('workouts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('challenges').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('badges').select('*').eq('user_id', userId),
      supabase.from('reminders').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_settings').select('*').eq('id', userId).maybeSingle(),
    ]);

  // Seed profile if it doesn't exist
  let profile: UserProfile;
  if (profileRes.data) {
    profile = mapProfile(profileRes.data as ProfileRow);
  } else {
    await seedProfile(userId);
    profile = {
      name: 'Athlete', level: 1, xp: 0, xpToNext: 100, totalXp: 0, streak: 0, lastActiveDate: '', rank: 'Rookie',
    };
  }

  // Seed settings if they don't exist
  let settings: AppSettings;
  if (settingsRes.data) {
    settings = mapSettings(settingsRes.data as SettingsRow);
  } else {
    await seedSettings(userId);
    settings = { darkMode: true, notifications: false, voiceControl: false, offlineMode: true, units: 'metric', soundEnabled: true };
  }

  // Seed badges if none exist
  let badges: Badge[];
  if (badgesRes.data && badgesRes.data.length > 0) {
    badges = (badgesRes.data as BadgeRow[]).map(mapBadge);
    // Ensure all badge defs exist (in case new badges were added)
    const existingIds = new Set(badges.map((b) => b.id));
    const missing = defaultBadges().filter((b) => !existingIds.has(b.id));
    if (missing.length > 0) {
      await seedBadges(userId, missing);
      badges = [...badges, ...missing];
    }
  } else {
    const defaults = defaultBadges();
    await seedBadges(userId, defaults);
    badges = defaults;
  }

  // Seed default reminders if none exist
  let reminders: Reminder[];
  if (remindersRes.data && remindersRes.data.length > 0) {
    reminders = (remindersRes.data as ReminderRow[]).map(mapReminder);
  } else {
    const defaults: Reminder[] = [
      { id: crypto.randomUUID(), title: 'Morning Workout', time: '06:30', enabled: true, days: [1, 2, 3, 4, 5] },
      { id: crypto.randomUUID(), title: 'Evening Stretch', time: '20:00', enabled: true, days: [1, 2, 3, 4, 5, 6, 0] },
    ];
    for (const r of defaults) {
      await supabase.from('reminders').insert({
        id: r.id, user_id: userId, title: r.title, time: r.time, enabled: r.enabled, days: r.days,
      });
    }
    reminders = defaults;
  }

  return {
    profile,
    workouts: (workoutsRes.data as WorkoutRow[] ?? []).map(mapWorkout),
    goals: (goalsRes.data as GoalRow[] ?? []).map(mapGoal),
    habits: (habitsRes.data as HabitRow[] ?? []).map(mapHabit),
    challenges: (challengesRes.data as ChallengeRow[] ?? []).map(mapChallenge),
    badges,
    reminders,
    settings,
  };
}

// ============ Seed helpers ============

async function seedProfile(userId: string): Promise<void> {
  await supabase.from('profiles').insert({
    id: userId, name: 'Athlete', level: 1, xp: 0, xp_to_next: 100, total_xp: 0, streak: 0, last_active_date: '', rank: 'Rookie',
  });
}

async function seedSettings(userId: string): Promise<void> {
  await supabase.from('user_settings').insert({
    id: userId, dark_mode: true, notifications: false, voice_control: false, offline_mode: true, units: 'metric', sound_enabled: true,
  });
}

async function seedBadges(userId: string, badges: Badge[]): Promise<void> {
  const rows = badges.map((b) => ({
    id: b.id, user_id: userId, name: b.name, description: b.description, icon: b.icon, tier: b.tier, unlocked: b.unlocked, unlocked_at: b.unlockedAt ?? null,
  }));
  await supabase.from('badges').upsert(rows, { onConflict: 'id,user_id' });
}

// ============ CRUD: Workouts ============

export async function dbAddWorkout(userId: string, w: Workout): Promise<void> {
  await supabase.from('workouts').insert({
    id: w.id, user_id: userId, date: w.date, title: w.title, category: w.category,
    exercises: w.exercises, duration_min: w.durationMin, notes: w.notes ?? null, created_at: w.createdAt,
  });
}

export async function dbDeleteWorkout(id: string): Promise<void> {
  await supabase.from('workouts').delete().eq('id', id);
}

// ============ CRUD: Goals ============

export async function dbAddGoal(userId: string, g: Goal): Promise<void> {
  await supabase.from('goals').insert({
    id: g.id, user_id: userId, title: g.title, description: g.description, category: g.category,
    target: g.target, current: g.current, unit: g.unit, deadline: g.deadline, status: g.status, created_at: g.createdAt,
  });
}

export async function dbUpdateGoal(g: Goal): Promise<void> {
  await supabase.from('goals').update({
    title: g.title, description: g.description, category: g.category, target: g.target,
    current: g.current, unit: g.unit, deadline: g.deadline, status: g.status,
  }).eq('id', g.id);
}

export async function dbDeleteGoal(id: string): Promise<void> {
  await supabase.from('goals').delete().eq('id', id);
}

// ============ CRUD: Habits ============

export async function dbAddHabit(userId: string, h: Habit): Promise<void> {
  await supabase.from('habits').insert({
    id: h.id, user_id: userId, name: h.name, icon: h.icon, frequency: h.frequency,
    streak: h.streak, completed_dates: h.completedDates, created_at: h.createdAt,
  });
}

export async function dbUpdateHabit(h: Habit): Promise<void> {
  await supabase.from('habits').update({
    name: h.name, icon: h.icon, frequency: h.frequency, streak: h.streak, completed_dates: h.completedDates,
  }).eq('id', h.id);
}

export async function dbDeleteHabit(id: string): Promise<void> {
  await supabase.from('habits').delete().eq('id', id);
}

// ============ CRUD: Challenges ============

export async function dbAddChallenge(userId: string, c: Challenge): Promise<void> {
  await supabase.from('challenges').insert({
    id: c.id, user_id: userId, title: c.title, description: c.description, duration_days: c.durationDays,
    xp_reward: c.xpReward, progress: c.progress, status: c.status, start_date: c.startDate, created_at: c.createdAt,
  });
}

export async function dbUpdateChallenge(c: Challenge): Promise<void> {
  await supabase.from('challenges').update({
    title: c.title, description: c.description, duration_days: c.durationDays,
    xp_reward: c.xpReward, progress: c.progress, status: c.status, start_date: c.startDate,
  }).eq('id', c.id);
}

export async function dbDeleteChallenge(id: string): Promise<void> {
  await supabase.from('challenges').delete().eq('id', id);
}

// ============ CRUD: Reminders ============

export async function dbAddReminder(userId: string, r: Reminder): Promise<void> {
  await supabase.from('reminders').insert({
    id: r.id, user_id: userId, title: r.title, time: r.time, enabled: r.enabled, days: r.days,
  });
}

export async function dbUpdateReminder(r: Reminder): Promise<void> {
  await supabase.from('reminders').update({
    title: r.title, time: r.time, enabled: r.enabled, days: r.days,
  }).eq('id', r.id);
}

export async function dbDeleteReminder(id: string): Promise<void> {
  await supabase.from('reminders').delete().eq('id', id);
}

// ============ CRUD: Badges ============

export async function dbUpdateBadge(b: Badge): Promise<void> {
  await supabase.from('badges').update({
    unlocked: b.unlocked, unlocked_at: b.unlockedAt ?? null,
  }).eq('id', b.id);
}

export async function dbUpsertBadges(userId: string, badges: Badge[]): Promise<void> {
  const rows = badges.map((b) => ({
    id: b.id, user_id: userId, name: b.name, description: b.description, icon: b.icon,
    tier: b.tier, unlocked: b.unlocked, unlocked_at: b.unlockedAt ?? null,
  }));
  await supabase.from('badges').upsert(rows, { onConflict: 'id,user_id' });
}

// ============ CRUD: Profile ============

export async function dbUpdateProfile(userId: string, p: Partial<UserProfile>): Promise<void> {
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (p.name !== undefined) update.name = p.name;
  if (p.level !== undefined) update.level = p.level;
  if (p.xp !== undefined) update.xp = p.xp;
  if (p.xpToNext !== undefined) update.xp_to_next = p.xpToNext;
  if (p.totalXp !== undefined) update.total_xp = p.totalXp;
  if (p.streak !== undefined) update.streak = p.streak;
  if (p.lastActiveDate !== undefined) update.last_active_date = p.lastActiveDate;
  if (p.rank !== undefined) update.rank = p.rank;
  await supabase.from('profiles').update(update).eq('id', userId);
}

// ============ CRUD: Settings ============

export async function dbUpdateSettings(userId: string, s: Partial<AppSettings>): Promise<void> {
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (s.darkMode !== undefined) update.dark_mode = s.darkMode;
  if (s.notifications !== undefined) update.notifications = s.notifications;
  if (s.voiceControl !== undefined) update.voice_control = s.voiceControl;
  if (s.offlineMode !== undefined) update.offline_mode = s.offlineMode;
  if (s.units !== undefined) update.units = s.units;
  if (s.soundEnabled !== undefined) update.sound_enabled = s.soundEnabled;
  await supabase.from('user_settings').update(update).eq('id', userId);
}
