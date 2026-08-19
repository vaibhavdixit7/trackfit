import { useEffect, useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Dumbbell, Bell } from 'lucide-react';

type TimerMode = 'rest' | 'stopwatch' | 'pomodoro';

export function Timers() {
  const [mode, setMode] = useState<TimerMode>('rest');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Mode selector */}
      <div className="flex gap-2">
        <ModeButton active={mode === 'rest'} onClick={() => setMode('rest')} icon={Dumbbell} label="Rest Timer" />
        <ModeButton active={mode === 'stopwatch'} onClick={() => setMode('stopwatch')} icon={Timer} label="Stopwatch" />
        <ModeButton active={mode === 'pomodoro'} onClick={() => setMode('pomodoro')} icon={Coffee} label="Pomodoro" />
      </div>

      {mode === 'rest' && <RestTimer />}
      {mode === 'stopwatch' && <Stopwatch />}
      {mode === 'pomodoro' && <Pomodoro />}
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all ${
        active ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function RestTimer() {
  const [seconds, setSeconds] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0) {
      // Vibrate or beep
      if ('vibrate' in navigator) navigator.vibrate(200);
    }
  }, [remaining]);

  const presets = [30, 45, 60, 90, 120, 180];

  const reset = (newSec?: number) => {
    setRunning(false);
    const s = newSec ?? seconds;
    setSeconds(s);
    setRemaining(s);
  };

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="card p-6 sm:p-8 flex flex-col items-center">
      <div className="relative">
        <svg className="w-64 h-64 -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r="120" fill="none" strokeWidth="12" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <circle
            cx="140" cy="140" r="120" fill="none" strokeWidth="12"
            className="stroke-primary-500 transition-all duration-300"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-display font-bold tabular-nums">{formatTime(remaining * 1000)}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Rest Timer</div>
        </div>
      </div>

      <div className="flex gap-2 mt-6 flex-wrap justify-center">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => reset(p)}
            className={`badge-pill ${seconds === p && remaining === p ? 'bg-primary-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            {p}s
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => reset()} className="btn-secondary">
          <RotateCcw size={18} /> Reset
        </button>
        <button onClick={() => setRunning(!running)} className="btn-primary">
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 10);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps((prev) => [elapsed, ...prev]);
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  return (
    <div className="card p-6 sm:p-8 flex flex-col items-center">
      <div className="text-6xl font-display font-bold tabular-nums my-6">{formatMs(elapsed)}</div>

      <div className="flex gap-3">
        <button onClick={reset} className="btn-secondary">
          <RotateCcw size={18} /> Reset
        </button>
        <button onClick={lap} disabled={!running} className="btn-secondary">
          Lap
        </button>
        <button onClick={() => setRunning(!running)} className="btn-primary">
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? 'Pause' : 'Start'}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="w-full mt-6 space-y-1.5 max-h-48 overflow-y-auto">
          {laps.map((l, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
              <span className="text-neutral-500 dark:text-neutral-400">Lap {laps.length - i}</span>
              <span className="font-mono font-semibold tabular-nums">{formatMs(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pomodoro() {
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = (isBreak ? breakMin : workMin) * 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            if (!isBreak) {
              setCompletedSessions((c) => c + 1);
              setIsBreak(true);
              return breakMin * 60;
            } else {
              setIsBreak(false);
              return workMin * 60;
            }
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, isBreak, workMin, breakMin]);

  useEffect(() => {
    if (remaining === totalSec) return;
  }, [totalSec]);

  const reset = () => {
    setRunning(false);
    setIsBreak(false);
    setRemaining(workMin * 60);
  };

  const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="card p-6 sm:p-8 flex flex-col items-center">
      <div className={`badge-pill mb-4 ${isBreak ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600' : 'bg-primary-50 dark:bg-primary-600/10 text-primary-600'}`}>
        {isBreak ? <Coffee size={13} /> : <Dumbbell size={13} />}
        {isBreak ? 'Break Time' : 'Focus Time'}
      </div>

      <div className="relative">
        <svg className="w-64 h-64 -rotate-90" viewBox="0 0 280 280">
          <circle cx="140" cy="140" r="120" fill="none" strokeWidth="12" className="stroke-neutral-200 dark:stroke-neutral-800" />
          <circle
            cx="140" cy="140" r="120" fill="none" strokeWidth="12"
            className={isBreak ? 'stroke-blue-500' : 'stroke-primary-500'}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-display font-bold tabular-nums">{formatTime(remaining * 1000)}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {completedSessions} sessions completed
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Work</label>
          <input
            type="number" className="input !w-16 !py-1.5 text-center" value={workMin}
            onChange={(e) => { setWorkMin(Number(e.target.value)); if (!isBreak) setRemaining(Number(e.target.value) * 60); }}
            min={1} max={60}
          />
          <span className="text-xs text-neutral-400">min</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500 dark:text-neutral-400">Break</label>
          <input
            type="number" className="input !w-16 !py-1.5 text-center" value={breakMin}
            onChange={(e) => { setBreakMin(Number(e.target.value)); if (isBreak) setRemaining(Number(e.target.value) * 60); }}
            min={1} max={30}
          />
          <span className="text-xs text-neutral-400">min</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={reset} className="btn-secondary">
          <RotateCcw size={18} /> Reset
        </button>
        <button onClick={() => setRunning(!running)} className="btn-primary">
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}
