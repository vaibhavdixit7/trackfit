/*
# Create FitTrack database tables

1. Overview
   This migration creates the full database schema for the FitTrack gym progress
   tracking app. All tables are user-scoped (multi-tenant via auth.uid()) with
   Row Level Security enabled so each user only sees and modifies their own data.

2. New Tables
   - `profiles` — user display name, level, XP, streak, rank (1:1 with auth.users)
   - `workouts` — logged workout sessions with exercises stored as JSONB
   - `goals` — fitness goals with progress tracking and deadlines
   - `habits` — daily/weekly habits with completed dates stored as JSONB array
   - `challenges` — timed challenges with progress and XP rewards
   - `badges` — gamification badges with unlock state per user
   - `reminders` — scheduled workout/habit reminders with day/time config
   - `user_settings` — per-user app settings (dark mode, voice, notifications, etc.)

3. Security
   - RLS enabled on ALL tables.
   - Every table has 4 CRUD policies (SELECT, INSERT, UPDATE, DELETE) scoped to
     `TO authenticated` with `auth.uid() = user_id` ownership checks.
   - All `user_id` columns default to `auth.uid()` so inserts that omit user_id
     still satisfy the WITH CHECK policy.
   - `profiles` table uses `id` (matching auth.users.id) instead of a separate
     user_id column, with policies checking `auth.uid() = id`.

4. Important Notes
   - Exercises array on workouts is stored as JSONB for flexibility.
   - Completed dates on habits stored as JSONB text array.
   - Badge definitions are seeded client-side; the table stores unlock state only.
   - Reminders `days` column stores day-of-week as JSONB integer array (0=Sun..6=Sat).
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Athlete',
  level int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  xp_to_next int NOT NULL DEFAULT 100,
  total_xp int NOT NULL DEFAULT 0,
  streak int NOT NULL DEFAULT 0,
  last_active_date text NOT NULL DEFAULT '',
  rank text NOT NULL DEFAULT 'Rookie',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============ WORKOUTS ============
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  exercises jsonb NOT NULL DEFAULT '[]',
  duration_min int NOT NULL DEFAULT 0,
  notes text,
  created_at bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_workouts" ON workouts;
CREATE POLICY "select_own_workouts" ON workouts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_workouts" ON workouts;
CREATE POLICY "insert_own_workouts" ON workouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_workouts" ON workouts;
CREATE POLICY "update_own_workouts" ON workouts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_workouts" ON workouts;
CREATE POLICY "delete_own_workouts" ON workouts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);

-- ============ GOALS ============
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  target int NOT NULL DEFAULT 1,
  current int NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT '',
  deadline text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- ============ HABITS ============
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💪',
  frequency text NOT NULL DEFAULT 'daily',
  streak int NOT NULL DEFAULT 0,
  completed_dates jsonb NOT NULL DEFAULT '[]',
  created_at bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_habits" ON habits;
CREATE POLICY "select_own_habits" ON habits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_habits" ON habits;
CREATE POLICY "insert_own_habits" ON habits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_habits" ON habits;
CREATE POLICY "update_own_habits" ON habits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_habits" ON habits;
CREATE POLICY "delete_own_habits" ON habits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

-- ============ CHALLENGES ============
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_days int NOT NULL DEFAULT 7,
  xp_reward int NOT NULL DEFAULT 300,
  progress int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  start_date text NOT NULL,
  created_at bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_challenges" ON challenges;
CREATE POLICY "select_own_challenges" ON challenges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_challenges" ON challenges;
CREATE POLICY "insert_own_challenges" ON challenges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_challenges" ON challenges;
CREATE POLICY "update_own_challenges" ON challenges FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_challenges" ON challenges;
CREATE POLICY "delete_own_challenges" ON challenges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);

-- ============ BADGES ============
CREATE TABLE IF NOT EXISTS badges (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  tier text NOT NULL DEFAULT 'bronze',
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at bigint
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_badges" ON badges;
CREATE POLICY "select_own_badges" ON badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_badges" ON badges;
CREATE POLICY "insert_own_badges" ON badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_badges" ON badges;
CREATE POLICY "update_own_badges" ON badges FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_badges" ON badges;
CREATE POLICY "delete_own_badges" ON badges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- ============ REMINDERS ============
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  time text NOT NULL DEFAULT '08:00',
  enabled boolean NOT NULL DEFAULT true,
  days jsonb NOT NULL DEFAULT '[1,2,3,4,5]'
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);

-- ============ USER SETTINGS ============
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode boolean NOT NULL DEFAULT true,
  notifications boolean NOT NULL DEFAULT false,
  voice_control boolean NOT NULL DEFAULT false,
  offline_mode boolean NOT NULL DEFAULT true,
  units text NOT NULL DEFAULT 'metric',
  sound_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = id);
