import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Modal } from '@/components/Modal';
import { todayISO } from '@/lib/gamification';
import { type Habit, type HabitFrequency } from '@/types';
import { Plus, Trash2, Flame, Check, Repeat } from 'lucide-react';

const ICON_OPTIONS = ['💪', '🏃', '🧘', '🚴', '🏊', '🤸', '🥗', '💧', '😴', '🧘‍♂️'];

export function Habits() {
  const { data, addHabit, toggleHabit, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const today = todayISO();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      frequency,
      streak: 0,
      completedDates: [],
      createdAt: Date.now(),
    };
    addHabit(habit);
    setName('');
    setIcon('💪');
    setShowForm(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
        <Plus size={18} /> Add New Habit
      </button>

      {data.habits.length === 0 ? (
        <div className="card p-10 text-center">
          <Repeat size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">No habits tracked yet</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Add daily or weekly habits to build your routine</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.habits.map((h) => {
            const doneToday = h.completedDates.includes(today);
            return (
              <div key={h.id} className="card card-hover p-4 group">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabit(h.id, today)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl shrink-0 transition-all ${
                      doneToday
                        ? 'bg-primary-600 text-white scale-105 shadow-sm shadow-primary-600/30'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {doneToday ? <Check size={20} /> : <span>{h.icon}</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{h.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge-pill bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">{h.frequency}</span>
                      {h.streak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-accent-600 dark:text-accent-400 font-semibold">
                          <Flame size={12} /> {h.streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteHabit(h.id)} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500">
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Week view */}
                <div className="mt-3 flex items-center gap-1.5">
                  {last7Days.map((date) => {
                    const done = h.completedDates.includes(date);
                    const isToday = date === today;
                    return (
                      <div key={date} className="flex-1 text-center">
                        <div className="text-[10px] text-neutral-400 mb-1">
                          {new Date(date).toLocaleDateString('en', { weekday: 'narrow' })}
                        </div>
                        <button
                          onClick={() => toggleHabit(h.id, date)}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                            done
                              ? 'bg-primary-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          } ${isToday ? 'ring-2 ring-primary-500/40' : ''}`}
                        >
                          {done && <Check size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Habit">
        <div className="space-y-4">
          <div>
            <label className="label">Habit Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Drink 8 glasses of water" autoFocus />
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
                    icon === ic ? 'bg-primary-600 ring-2 ring-primary-500/40 scale-105' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as HabitFrequency[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`flex-1 btn ${frequency === f ? 'bg-primary-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
                >
                  {f === 'daily' ? 'Daily' : 'Weekly'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Add Habit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
