import { useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import { exportData, importData } from '@/lib/storage';
import {
  Moon, Sun, Bell, Mic, Wifi, WifiOff, Volume2, Download, Upload,
  User, Share2, Trash2, Check, AlertCircle,
} from 'lucide-react';

export function Settings() {
  const { data, updateSettings, updateProfile, updateReminder, addReminder, deleteReminder, setData } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [name, setName] = useState(data.profile.name);
  const [newReminder, setNewReminder] = useState({ title: '', time: '08:00' });

  const handleExport = () => exportData(data);

  const handleImport = async (file: File) => {
    try {
      const imported = await importData(file);
      setData(imported);
      setImportMsg({ type: 'success', text: 'Backup restored successfully!' });
      setTimeout(() => setImportMsg(null), 3000);
    } catch {
      setImportMsg({ type: 'error', text: 'Could not restore backup file' });
      setTimeout(() => setImportMsg(null), 3000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'FitTrack',
      text: `I'm on level ${data.profile.level} with ${data.profile.streak} day streak and ${data.badges.filter(b => b.unlocked).length} badges! Join me on FitTrack.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
        setImportMsg({ type: 'success', text: 'Progress copied to clipboard!' });
        setTimeout(() => setImportMsg(null), 3000);
      }
    } catch {
      // user cancelled
    }
  };

  const handleAddReminder = () => {
    if (!newReminder.title.trim()) return;
    addReminder({
      id: crypto.randomUUID(),
      title: newReminder.title.trim(),
      time: newReminder.time,
      enabled: true,
      days: [1, 2, 3, 4, 5],
    });
    setNewReminder({ title: '', time: '08:00' });
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      {importMsg && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${importMsg.type === 'success' ? 'bg-success-500/10 text-success-600' : 'bg-error-500/10 text-error-600'}`}>
          {importMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {importMsg.text}
        </div>
      )}

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div>
          <label className="label">Display Name</label>
          <div className="flex gap-2">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={() => updateProfile({ name: name.trim() || 'Athlete' })} className="btn-primary shrink-0">Save</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Level" value={data.profile.level} />
          <Stat label="Total XP" value={data.profile.totalXp} />
          <Stat label="Rank" value={data.profile.rank} />
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={data.settings.darkMode ? Moon : Sun}>
        <Toggle
          icon={data.settings.darkMode ? Moon : Sun}
          label="Dark Mode"
          description="Switch between light and dark themes"
          checked={data.settings.darkMode}
          onChange={(v) => updateSettings({ darkMode: v })}
        />
        <Toggle
          icon={Volume2}
          label="Sound Effects"
          description="Play sounds for timers and notifications"
          checked={data.settings.soundEnabled}
          onChange={(v) => updateSettings({ soundEnabled: v })}
        />
      </Section>

      {/* Notifications & Voice */}
      <Section title="Notifications & Voice" icon={Bell}>
        <Toggle
          icon={Bell}
          label="Push Notifications"
          description="Get reminders for workouts and habits"
          checked={data.settings.notifications}
          onChange={(v) => updateSettings({ notifications: v })}
        />
        <Toggle
          icon={Mic}
          label="Voice Control"
          description="Navigate the app using voice commands"
          checked={data.settings.voiceControl}
          onChange={(v) => updateSettings({ voiceControl: v })}
        />
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 text-xs text-neutral-500 dark:text-neutral-400">
          Voice commands: "go to workouts", "open timer", "show badges", "go to dashboard", "open analytics"
        </div>
      </Section>

      {/* Reminders */}
      <Section title="Reminders" icon={Bell}>
        <div className="space-y-2">
          {data.reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
              <button
                onClick={() => updateReminder({ ...r, enabled: !r.enabled })}
                className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${r.enabled ? 'bg-primary-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'}`}
              >
                <Bell size={16} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.time}</p>
              </div>
              <div className="flex gap-0.5">
                {dayLabels.map((d, i) => (
                  <span key={i} className={`text-[10px] w-5 h-5 flex items-center justify-center rounded ${r.days.includes(i) ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-600 font-bold' : 'text-neutral-300 dark:text-neutral-600'}`}>
                    {d}
                  </span>
                ))}
              </div>
              <button onClick={() => deleteReminder(r.id)} className="btn-ghost p-1.5 text-neutral-400 hover:text-error-500 shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              className="input flex-1"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              placeholder="Reminder title"
            />
            <input
              type="time"
              className="input w-28"
              value={newReminder.time}
              onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
            />
            <button onClick={handleAddReminder} className="btn-primary shrink-0">Add</button>
          </div>
        </div>
      </Section>

      {/* Data & Backup */}
      <Section title="Data & Backup" icon={Download}>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExport} className="btn-secondary flex-col !py-4 h-auto">
            <Download size={20} />
            <span className="text-xs mt-1">Export Backup</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary flex-col !py-4 h-auto">
            <Upload size={20} />
            <span className="text-xs mt-1">Import Backup</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
        </div>
      </Section>

      {/* Collaboration */}
      <Section title="Collaboration" icon={Share2}>
        <button onClick={handleShare} className="btn-secondary w-full justify-start">
          <Share2 size={18} />
          <span>Share My Progress</span>
        </button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Share your fitness achievements with friends. Your data stays private — only a summary is shared.
        </p>
      </Section>

      {/* Offline mode */}
      <Section title="Connectivity" icon={data.settings.offlineMode ? WifiOff : Wifi}>
        <Toggle
          icon={WifiOff}
          label="Offline Mode"
          description="All data stored locally on your device"
          checked={data.settings.offlineMode}
          onChange={(v) => updateSettings({ offlineMode: v })}
        />
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-primary-600" />
        <h3 className="font-display font-bold text-base">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Toggle({ icon: Icon, label, description, checked, onChange }: { icon: any; label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0">
        <Icon size={18} className="text-neutral-500 dark:text-neutral-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3 text-center">
      <div className="text-lg font-display font-bold">{value}</div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
    </div>
  );
}
