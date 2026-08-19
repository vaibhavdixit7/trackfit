import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Modal } from '@/components/Modal';
import { CATEGORIES, type Exercise, type Workout } from '@/types';
import { Plus, Trash2, Dumbbell, Clock, TrendingUp, X } from 'lucide-react';

export function Workouts() {
  const { data, addWorkout, deleteWorkout } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', category: CATEGORIES[0], sets: 3, reps: 10, weight: 0 }]);

  const filtered = filter === 'all' ? data.workouts : data.workouts.filter((w) => w.category === filter);

  const resetForm = () => {
    setTitle('');
    setCategory(CATEGORIES[0]);
    setDuration(30);
    setNotes('');
    setExercises([{ name: '', category: CATEGORIES[0], sets: 3, reps: 10, weight: 0 }]);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const workout: Workout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      category,
      exercises: exercises.filter((e) => e.name.trim()),
      durationMin: duration,
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };
    addWorkout(workout);
    resetForm();
    setShowForm(false);
  };

  const updateExercise = (idx: number, field: keyof Exercise, value: string | number) => {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const addExercise = () => {
    setExercises((prev) => [...prev, { name: '', category, sets: 3, reps: 10, weight: 0 }]);
  };

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilter('all')}
          className={`badge-pill shrink-0 ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`badge-pill shrink-0 ${filter === c ? 'bg-primary-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
        <Plus size={18} /> Log New Workout
      </button>

      {/* Workout list */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Dumbbell size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">No workouts yet</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Log your first workout to start tracking progress</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((w) => (
            <div key={w.id} className="card card-hover p-4 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-600/10 shrink-0">
                    <Dumbbell size={20} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{w.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="badge-pill bg-primary-50 dark:bg-primary-600/10 text-primary-700 dark:text-primary-400">{w.category}</span>
                      <span className="flex items-center gap-0.5"><Clock size={11} /> {w.durationMin}m</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteWorkout(w.id)}
                  className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-error-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {w.exercises.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {w.exercises.slice(0, 3).map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="truncate">{e.name}</span>
                      <span className="shrink-0 ml-2 font-medium">{e.sets}×{e.reps} {e.weight > 0 && `· ${e.weight}kg`}</span>
                    </div>
                  ))}
                  {w.exercises.length > 3 && (
                    <p className="text-xs text-neutral-400">+{w.exercises.length - 3} more</p>
                  )}
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span>{new Date(w.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="flex items-center gap-0.5"><TrendingUp size={11} /> +50 XP</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Log New Workout" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Workout Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Upper Body Strength" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input type="number" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Exercises</label>
              <button onClick={addExercise} className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                <Plus size={14} /> Add Exercise
              </button>
            </div>
            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-end gap-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-2">
                  <div className="flex-1 min-w-0">
                    <input
                      className="input !py-2 text-sm"
                      value={ex.name}
                      onChange={(e) => updateExercise(i, 'name', e.target.value)}
                      placeholder="Exercise name"
                    />
                  </div>
                  <div className="w-16">
                    <input type="number" className="input !py-2 text-sm text-center" value={ex.sets}
                      onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))} min={0} />
                  </div>
                  <span className="text-xs text-neutral-400 pb-2.5">×</span>
                  <div className="w-16">
                    <input type="number" className="input !py-2 text-sm text-center" value={ex.reps}
                      onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))} min={0} />
                  </div>
                  <div className="w-16">
                    <input type="number" className="input !py-2 text-sm text-center" value={ex.weight}
                      onChange={(e) => updateExercise(i, 'weight', Number(e.target.value))} min={0} placeholder="kg" />
                  </div>
                  <button onClick={() => removeExercise(i)} className="btn-ghost p-2 text-neutral-400 hover:text-error-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input min-h-[80px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Save Workout</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
