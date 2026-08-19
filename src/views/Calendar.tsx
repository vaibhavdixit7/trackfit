import { useState } from 'react';
import { useApp } from '@/lib/store';
import { ChevronLeft, ChevronRight, Dumbbell, Repeat, Target } from 'lucide-react';

export function Calendar() {
  const { data } = useApp();
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const workoutMap = new Map<string, number>();
  data.workouts.forEach((w) => {
    workoutMap.set(w.date, (workoutMap.get(w.date) || 0) + 1);
  });

  const habitMap = new Map<string, number>();
  data.habits.forEach((h) => {
    h.completedDates.forEach((d) => {
      habitMap.set(d, (habitMap.get(d) || 0) + 1);
    });
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const monthName = current.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const monthWorkouts = data.workouts.filter((w) => {
    const wd = new Date(w.date);
    return wd.getMonth() === month && wd.getFullYear() === year;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Calendar header */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">{monthName}</h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={18} /></button>
            <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-neutral-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const workouts = workoutMap.get(dateStr) || 0;
            const habits = habitMap.get(dateStr) || 0;
            const isToday = dateStr === todayStr;
            const hasActivity = workouts > 0 || habits > 0;

            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                  isToday
                    ? 'bg-primary-600 text-white font-bold'
                    : hasActivity
                    ? 'bg-primary-50 dark:bg-primary-600/10 text-primary-700 dark:text-primary-400'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span>{day}</span>
                {hasActivity && !isToday && (
                  <div className="flex gap-0.5 mt-0.5">
                    {workouts > 0 && <div className="w-1 h-1 rounded-full bg-primary-500" />}
                    {habits > 0 && <div className="w-1 h-1 rounded-full bg-accent-500" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary-500" /> Workout</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-500" /> Habit</span>
        </div>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <Dumbbell size={18} className="mx-auto text-primary-600 mb-1.5" />
          <div className="text-xl font-display font-bold">{monthWorkouts.length}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Workouts</div>
        </div>
        <div className="card p-4 text-center">
          <Target size={18} className="mx-auto text-blue-600 mb-1.5" />
          <div className="text-xl font-display font-bold">{monthWorkouts.reduce((s, w) => s + w.durationMin, 0)}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Minutes</div>
        </div>
        <div className="card p-4 text-center">
          <Repeat size={18} className="mx-auto text-accent-600 mb-1.5" />
          <div className="text-xl font-display font-bold">
            {Array.from(habitMap.entries()).filter(([d]) => {
              const hd = new Date(d);
              return hd.getMonth() === month && hd.getFullYear() === year;
            }).length}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Habit days</div>
        </div>
      </div>
    </div>
  );
}
