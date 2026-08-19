import { useApp } from '@/lib/store';
import { Dumbbell, Clock, TrendingUp, Calendar, Flame } from 'lucide-react';
import { CATEGORIES } from '@/types';

export function Analytics() {
  const { data } = useApp();

  const totalWorkouts = data.workouts.length;
  const totalMinutes = data.workouts.reduce((s, w) => s + w.durationMin, 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Last 30 days activity
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const activityMap = new Map<string, number>();
  data.workouts.forEach((w) => {
    activityMap.set(w.date, (activityMap.get(w.date) || 0) + 1);
  });

  const maxActivity = Math.max(1, ...last30.map((d) => activityMap.get(d) || 0));

  // Category distribution
  const categoryCount: Record<string, number> = {};
  data.workouts.forEach((w) => {
    categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(1, ...Object.values(categoryCount));

  // Weekly volume (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const end = new Date();
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const count = data.workouts.filter((w) => {
      const wd = new Date(w.date);
      return wd >= start && wd <= end;
    }).length;
    return { week: `W${8 - i}`, count };
  }).reverse();
  const maxWeekly = Math.max(1, ...weeklyData.map((w) => w.count));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={Dumbbell} label="Total Workouts" value={totalWorkouts} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-600/10" />
        <SummaryCard icon={Clock} label="Total Minutes" value={totalMinutes} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-600/10" />
        <SummaryCard icon={TrendingUp} label="Avg Duration" value={`${avgDuration}m`} color="text-accent-600" bg="bg-accent-50 dark:bg-accent-500/10" />
        <SummaryCard icon={Flame} label="Best Streak" value={`${data.profile.streak}d`} color="text-yellow-600" bg="bg-yellow-50 dark:bg-yellow-600/10" />
      </div>

      {/* 30-day activity heatmap */}
      <div className="card p-5">
        <h3 className="font-display font-bold text-base mb-4">30-Day Activity</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {last30.map((date) => {
            const count = activityMap.get(date) || 0;
            const intensity = count === 0 ? 0 : Math.ceil((count / maxActivity) * 4);
            const colors = [
              'bg-neutral-100 dark:bg-neutral-800',
              'bg-primary-200 dark:bg-primary-800',
              'bg-primary-400 dark:bg-primary-600',
              'bg-primary-500 dark:bg-primary-500',
              'bg-primary-600 dark:bg-primary-400',
            ];
            return (
              <div
                key={date}
                className={`aspect-square rounded ${colors[intensity]}`}
                title={`${date}: ${count} workout${count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
          <span>30 days ago</span>
          <div className="flex items-center gap-1">
            <span className="mr-1">Less</span>
            {colors.map((c, i) => <div key={i} className={`w-3 h-3 rounded ${c}`} />)}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-base mb-4">Workouts by Category</h3>
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{cat}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly chart */}
        <div className="card p-5">
          <h3 className="font-display font-bold text-base mb-4">Weekly Workouts (Last 8 Weeks)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyData.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500"
                    style={{ height: `${(w.count / maxWeekly) * 100}%`, minHeight: w.count > 0 ? '8px' : '2px' }}
                    title={`${w.count} workouts`}
                  />
                </div>
                <span className="text-[10px] text-neutral-400">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* XP progression */}
      <div className="card p-5">
        <h3 className="font-display font-bold text-base mb-4">Level Progression</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <div className="text-center">
              <div className="text-2xl font-display font-bold leading-none">{data.profile.level}</div>
              <div className="text-[10px]">Level</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-semibold">{data.profile.rank}</span>
              <span className="text-neutral-500 dark:text-neutral-400">{data.profile.totalXp} total XP</span>
            </div>
            <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700" style={{ width: `${Math.min(100, (data.profile.xp / data.profile.xpToNext) * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mt-1">
              <span>{data.profile.xp} XP</span>
              <span>{data.profile.xpToNext} XP to next level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const colors = [
  'bg-neutral-100 dark:bg-neutral-800',
  'bg-primary-200 dark:bg-primary-800',
  'bg-primary-400 dark:bg-primary-600',
  'bg-primary-500 dark:bg-primary-500',
  'bg-primary-600 dark:bg-primary-400',
];

function SummaryCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className="card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}
