import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Modal } from '@/components/Modal';
import { CATEGORIES, type Goal } from '@/types';
import { Plus, Trash2, Target, CheckCircle2, Circle, Calendar } from 'lucide-react';

export function Goals() {
  const { data, addGoal, updateGoal, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [target, setTarget] = useState(10);
  const [unit, setUnit] = useState('workouts');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const activeGoals = data.goals.filter((g) => g.status === 'active');
  const completedGoals = data.goals.filter((g) => g.status === 'completed');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const goal: Goal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      target,
      current: 0,
      unit,
      deadline,
      status: 'active',
      createdAt: Date.now(),
    };
    addGoal(goal);
    setTitle('');
    setDescription('');
    setTarget(10);
    setShowForm(false);
  };

  const increment = (g: Goal) => {
    const updated = { ...g, current: Math.min(g.target, g.current + 1) };
    if (updated.current >= updated.target) updated.status = 'completed';
    updateGoal(updated);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
        <Plus size={18} /> Create New Goal
      </button>

      {data.goals.length === 0 ? (
        <div className="card p-10 text-center">
          <Target size={40} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">No goals yet</p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Set your first fitness goal to start working towards it</p>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Active Goals</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {activeGoals.map((g) => {
                  const pct = Math.min(100, (g.current / g.target) * 100);
                  const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={g.id} className="card card-hover p-4 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-600/10 shrink-0">
                            <Target size={20} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{g.title}</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{g.description || g.category}</p>
                          </div>
                        </div>
                        <button onClick={() => deleteGoal(g.id)} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold">{g.current} / {g.target} {g.unit}</span>
                          <span className="text-neutral-500 dark:text-neutral-400">{Math.round(pct)}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Calendar size={11} />
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </span>
                        <button onClick={() => increment(g)} className="btn-secondary !py-1.5 !px-3 text-xs">
                          +1 Progress
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Completed Goals</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {completedGoals.map((g) => (
                  <div key={g.id} className="card p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-success-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate line-through">{g.title}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{g.target} {g.unit} achieved</p>
                      </div>
                      <button onClick={() => deleteGoal(g.id)} className="btn-ghost p-1.5 text-neutral-400 hover:text-error-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create New Goal">
        <div className="space-y-4">
          <div>
            <label className="label">Goal Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Run 50km this month" autoFocus />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does success look like?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. km, workouts" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target</label>
              <input type="number" className="input" value={target} onChange={(e) => setTarget(Number(e.target.value))} min={1} />
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Create Goal</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
