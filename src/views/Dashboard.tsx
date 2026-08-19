import { useApp } from '@/lib/store';
import { todayISO } from '@/lib/gamification';
import type { ViewKey } from '@/types';
import {
  Flame, Dumbbell, Target, Trophy, Zap, TrendingUp,
  Calendar, Award, ChevronRight, CheckCircle2, Clock,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (v: ViewKey) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data } = useApp();
  const today = todayISO();

  const todayWorkouts = data.workouts.filter((w) => w.date === today);
  const todayHabits = data.habits.filter((h) => h.completedDates.includes(today));
  const activeGoals = data.goals.filter((g) => g.status === 'active');
  const activeChallenges = data.challenges.filter((c) => c.status === 'active');
  const unlockedBadges = data.badges.filter((b) => b.unlocked);

  const totalMinutes = data.workouts.reduce((sum, w) => sum + w.durationMin, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekWorkouts = data.workouts.filter((w) => new Date(w.date) >= weekAgo);
  const weekMinutes = weekWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

  const stats = [
    { label: 'Day Streak', value: data.profile.streak, icon: Flame, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-500/10' },
    { label: 'Total Workouts', value: data.workouts.length, icon: Dumbbell, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-600/10' },
    { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-600/10' },
    { label: 'Badges Earned', value: unlockedBadges.length, icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-600/10' },
  ];

  const quickActions: { label: string; icon: any; view: ViewKey; color: string }[] = [
    { label: 'Log Workout', icon: Dumbbell, view: 'workouts', color: 'bg-primary-600' },
    { label: 'Timers', icon: Clock, view: 'timers', color: 'bg-blue-600' },
    { label: 'Goals', icon: Target, view: 'goals', color: 'bg-purple-600' },
    { label: 'Badges', icon: Trophy, view: 'badges', color: 'bg-yellow-600' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero greeting */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-100 text-sm">Welcome back,</p>
            <h2 className="font-display text-2xl font-bold mt-0.5">{data.profile.name}</h2>
            <p className="text-primary-100 text-sm mt-1">
              {todayWorkouts.length > 0
                ? `You've completed ${todayWorkouts.length} workout${todayWorkouts.length > 1 ? 's' : ''} today. Keep it up!`
                : 'Ready to crush your fitness goals today?'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-display font-bold">{data.profile.level}</div>
            <div className="text-xs text-primary-100">Level</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-primary-100 mb-1.5">
            <span className="flex items-center gap-1"><Zap size={12} /> {data.profile.xp} XP</span>
            <span>{data.profile.xpToNext} XP to level {data.profile.level + 1}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${Math.min(100, (data.profile.xp / data.profile.xpToNext) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card card-hover p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => onNavigate(a.view)}
              className="card card-hover p-4 flex items-center gap-3 group"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.color} text-white`}>
                <Icon size={18} />
              </div>
              <span className="text-sm font-semibold">{a.label}</span>
              <ChevronRight size={16} className="ml-auto text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">Today's Progress</h3>
            <button onClick={() => onNavigate('calendar')} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              View Calendar <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <ProgressRow label="Workouts" done={todayWorkouts.length} total={Math.max(1, todayWorkouts.length)} icon={Dumbbell} />
            <ProgressRow label="Habits" done={todayHabits.length} total={data.habits.length} icon={CheckCircle2} />
            <ProgressRow label="Active goals" done={activeGoals.filter(g => g.current >= g.target).length} total={activeGoals.length} icon={Target} />
          </div>
        </div>

        {/* Weekly summary */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">This Week</h3>
            <TrendingUp size={18} className="text-primary-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
              <div className="text-2xl font-display font-bold">{weekWorkouts.length}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Workouts</div>
            </div>
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
              <div className="text-2xl font-display font-bold">{weekMinutes}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Minutes</div>
            </div>
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
              <div className="text-2xl font-display font-bold">{totalMinutes}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Total min</div>
            </div>
            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
              <div className="text-2xl font-display font-bold">{data.profile.totalXp}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Total XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active challenges */}
      {activeChallenges.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">Active Challenges</h3>
            <button onClick={() => onNavigate('challenges')} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {activeChallenges.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-600/10">
                  <Trophy size={18} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.title}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">{c.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent workouts */}
      {data.workouts.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base">Recent Workouts</h3>
            <button onClick={() => onNavigate('workouts')} className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {data.workouts.slice(0, 4).map((w) => (
              <div key={w.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-600/10">
                  <Dumbbell size={16} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{w.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{w.category} · {w.durationMin} min</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <Calendar size={12} />
                  {new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRow({ label, done, total, icon: Icon }: { label: string; done: number; total: number; icon: any }) {
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon size={15} className="text-neutral-400" />
          {label}
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{done}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
