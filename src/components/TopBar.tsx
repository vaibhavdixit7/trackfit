import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Moon, Sun } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { ViewKey } from '@/types';
import { NAV_ITEMS } from './navConfig';

interface TopBarProps {
  current: ViewKey;
  onVoiceCommand: (cmd: string) => void;
}

const VIEW_TITLES: Record<ViewKey, string> = {
  dashboard: 'Dashboard',
  workouts: 'Workouts',
  goals: 'Goals',
  habits: 'Habits',
  challenges: 'Challenges',
  timers: 'Timers',
  analytics: 'Analytics',
  calendar: 'Calendar',
  badges: 'Badges & Rewards',
  settings: 'Settings',
};

export function TopBar({ current, onVoiceCommand }: TopBarProps) {
  const { data, updateSettings } = useApp();
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState('');
  const recognitionRef = useRef<any>(null);
  const dark = data.settings.darkMode;

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setVoiceMsg(transcript);
      onVoiceCommand(transcript);
      setTimeout(() => setVoiceMsg(''), 3000);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, [onVoiceCommand]);

  const toggleVoice = () => {
    if (!data.settings.voiceControl) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const item = NAV_ITEMS.find((n) => n.key === current);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        {item && <item.icon size={22} className="text-primary-600" />}
        <h1 className="font-display text-lg sm:text-xl font-bold">{VIEW_TITLES[current]}</h1>
      </div>
      <div className="flex items-center gap-1">
        {voiceMsg && (
          <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400 mr-2 max-w-[200px] truncate">
            "{voiceMsg}"
          </span>
        )}
        {data.settings.voiceControl && (
          <button
            onClick={toggleVoice}
            className={`btn-ghost p-2.5 ${listening ? 'text-error-500' : ''}`}
            aria-label="Voice command"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <button
          onClick={() => updateSettings({ darkMode: !dark })}
          className="btn-ghost p-2.5"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
