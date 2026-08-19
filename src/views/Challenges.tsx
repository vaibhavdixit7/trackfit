import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Modal } from '@/components/Modal';
import { type Challenge } from '@/types';
import { Plus, Trash2, Trophy, Zap, CheckCircle2, Clock } from 'lucide-react';

const PRESET_CHALLENGES = [
  { title: '7-Day Push-Up Challenge', description: 'Do 50 push-ups every day for 7 days', durationDays: 7, xpReward: 300 },
  { title: '30-Day Plank Challenge', description: 'Hold a plank for increasing time each day', durationDays: 30, xpReward: 500 },
  { title: '10K Steps Daily', description: 'Walk 10,000 steps every day for 14 days', durationDays: 14, xpReward: 400 },
  { title: '5K Run Challenge', description: 'Run 5K three times a week for 4 weeks', durationDays: 28, xpReward: 600 },
  { title: 'No Sugar Challenge', description: 'Cut added sugar for 21 days', durationDays: 21, xpReward: 450 },
  { title: 'Morning Yoga', description: '10 minutes of yoga every morning for 14 days', durationDays: 14, xpReward: 350 },
];

export function Challenges() {
  const { data, addChallenge, updateChallenge, deleteChallenge } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(7);
  const [xpReward, setXpReward] = useState(300);

  const active = data.challenges.filter((c) => c.status === 'active');
  const completed = data.challenges.filter((c) => c.status === 'completed');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      durationDays: duration,
      xpReward,
      progress: 0,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    addChallenge(challenge);
    setTitle('');
    setDescription('');
    setDuration(7);
    setXpReward(300);
    setShowForm(false);
  };

  const startPreset = (preset: typeof PRESET_CHALLENGES[0]) => {
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      title: preset.title,
      description: preset.description,
      durationDays: preset.durationDays,
      xpReward: preset.xpReward,
      progress: 0,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    addChallenge(challenge);
  };

  const updateProgress = (c: Challenge, delta: number) => {
    const progress = Math.max(0, Math.min(100, c.progress + delta));
    const status = progress >= 100 ? 'completed' : 'active';
    updateChallenge({ ...c, progress, status });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => setShowForm(true)} className="btn-primary w-full sm:w-auto">
        <Plus size={18} /> Create Custom Challenge
      </button>

      {/* Preset challenges */}
      <div>
        <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Quick Start Challenges</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_CHALLENGES.map((p) => (
            <div key={p.title} className="card card-hover p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-600/10">
                  <Trophy size={16} className="text-yellow-600" />
                </div>
                <span className="badge-pill bg-yellow-50 dark:bg-yellow-600/10 text-yellow-700 dark:text-yellow-400">
                  <Zap size={11} /> {p.xpReward} XP
                </span>
              </div>
              <h4 className="font-semibold text-sm">{p.title}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-1">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-400 flex items-center gap-0.5"><Clock size={11} /> {p.durationDays} days</span>
                <button onClick={() => startPreset(p)} className="btn-secondary !py-1.5 !px-3 text-xs">Start</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active challenges */}
      {active.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Your Active Challenges</h3>
          <div className="space-y-3">
            {active.map((c) => {
              const daysPassed = Math.floor((Date.now() - new Date(c.startDate).getTime()) / 86400000);
              return (
                <div key={c.id} className="card card-hover p-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-600/10 shrink-0">
                        <Trophy size={20} className="text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm">{c.title}</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{c.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="badge-pill bg-yellow-50 dark:bg-yellow-600/10 text-yellow-700 dark:text-yellow-400">
                            <Zap size={11} /> {c.xpReward} XP
                          </span>
                          <span className="text-xs text-neutral-400">{daysPassed}/{c.durationDays} days</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteChallenge(c.id)} className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-error-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold">{c.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-accent-500 transition-all duration-500" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateProgress(c, -10)} className="btn-secondary !py-1.5 !px-3 text-xs flex-1">-10%</button>
                    <button onClick={() => updateProgress(c, 10)} className="btn-secondary !py-1.5 !px-3 text-xs flex-1">+10%</button>
                    <button onClick={() => updateProgress(c, 25)} className="btn-primary !py-1.5 !px-3 text-xs flex-1">+25%</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Completed Challenges</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {completed.map((c) => (
              <div key={c.id} className="card p-4 opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-success-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">+{c.xpReward} XP earned</p>
                  </div>
                  <button onClick={() => deleteChallenge(c.id)} className="btn-ghost p-1.5 text-neutral-400 hover:text-error-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Custom Challenge">
        <div className="space-y-4">
          <div>
            <label className="label">Challenge Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 100 Burpees Challenge" autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[70px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the challenge?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration (days)</label>
              <input type="number" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} />
            </div>
            <div>
              <label className="label">XP Reward</label>
              <input type="number" className="input" value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} min={10} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary flex-1">Create Challenge</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
