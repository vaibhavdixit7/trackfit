import type { AppData, Badge } from '@/types';

const BADGE_DEFS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first-workout', name: 'First Steps', description: 'Complete your first workout', icon: 'Dumbbell', tier: 'bronze' },
  { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: 'Flame', tier: 'bronze' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', tier: 'silver' },
  { id: 'streak-30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'Flame', tier: 'gold' },
  { id: 'workout-10', name: 'Getting Serious', description: 'Complete 10 workouts', icon: 'Trophy', tier: 'bronze' },
  { id: 'workout-50', name: 'Dedicated', description: 'Complete 50 workouts', icon: 'Trophy', tier: 'silver' },
  { id: 'workout-100', name: 'Centurion', description: 'Complete 100 workouts', icon: 'Trophy', tier: 'gold' },
  { id: 'goal-1', name: 'Achiever', description: 'Complete your first goal', icon: 'Target', tier: 'bronze' },
  { id: 'goal-5', name: 'Goal Getter', description: 'Complete 5 goals', icon: 'Target', tier: 'silver' },
  { id: 'challenge-1', name: 'Challenger', description: 'Complete your first challenge', icon: 'Award', tier: 'silver' },
  { id: 'challenge-5', name: 'Champion', description: 'Complete 5 challenges', icon: 'Award', tier: 'gold' },
  { id: 'early-bird', name: 'Early Bird', description: 'Workout before 7 AM', icon: 'Sunrise', tier: 'bronze' },
  { id: 'night-owl', name: 'Night Owl', description: 'Workout after 9 PM', icon: 'Moon', tier: 'bronze' },
  { id: 'level-5', name: 'Rising Star', description: 'Reach level 5', icon: 'Star', tier: 'silver' },
  { id: 'level-10', name: 'Fitness Pro', description: 'Reach level 10', icon: 'Star', tier: 'gold' },
  { id: 'level-20', name: 'Legend', description: 'Reach level 20', icon: 'Crown', tier: 'platinum' },
];

export function defaultBadges(): Badge[] {
  return BADGE_DEFS.map((b) => ({ ...b, unlocked: false }));
}

export function checkBadges(data: AppData): Badge[] {
  const updated = data.badges.map((b) => ({ ...b }));
  const workoutCount = data.workouts.length;
  const goalCount = data.goals.filter((g) => g.status === 'completed').length;
  const challengeCount = data.challenges.filter((c) => c.status === 'completed').length;
  const streak = data.profile.streak;
  const level = data.profile.level;

  const unlock = (id: string) => {
    const b = updated.find((x) => x.id === id);
    if (b && !b.unlocked) {
      b.unlocked = true;
      b.unlockedAt = Date.now();
    }
  };

  if (workoutCount >= 1) unlock('first-workout');
  if (streak >= 3) unlock('streak-3');
  if (streak >= 7) unlock('streak-7');
  if (streak >= 30) unlock('streak-30');
  if (workoutCount >= 10) unlock('workout-10');
  if (workoutCount >= 50) unlock('workout-50');
  if (workoutCount >= 100) unlock('workout-100');
  if (goalCount >= 1) unlock('goal-1');
  if (goalCount >= 5) unlock('goal-5');
  if (challengeCount >= 1) unlock('challenge-1');
  if (challengeCount >= 5) unlock('challenge-5');
  if (level >= 5) unlock('level-5');
  if (level >= 10) unlock('level-10');
  if (level >= 20) unlock('level-20');

  // Time-based badges
  data.workouts.forEach((w) => {
    const hour = new Date(w.createdAt).getHours();
    if (hour < 7) unlock('early-bird');
    if (hour >= 21) unlock('night-owl');
  });

  return updated;
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function applyXp(data: AppData, xpGained: number): AppData {
  let { xp, level, totalXp } = data.profile;
  xp += xpGained;
  totalXp += xpGained;
  let xpToNext = xpForLevel(level);
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level);
  }

  const ranks = [
    [1, 'Rookie'],
    [3, 'Beginner'],
    [5, 'Athlete'],
    [8, 'Competitor'],
    [12, 'Expert'],
    [16, 'Master'],
    [20, 'Legend'],
  ] as const;
  let rank = 'Rookie';
  for (const [lvl, r] of ranks) {
    if (level >= lvl) rank = r;
  }

  return {
    ...data,
    profile: { ...data.profile, xp, level, totalXp, xpToNext, rank },
  };
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function computeStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort();
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = cursor.toISOString().split('T')[0];
    if (sorted.includes(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
