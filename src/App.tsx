import { useCallback, useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { AuthPage } from '@/views/AuthPage';
import { Dashboard } from '@/views/Dashboard';
import { Workouts } from '@/views/Workouts';
import { Goals } from '@/views/Goals';
import { Habits } from '@/views/Habits';
import { Challenges } from '@/views/Challenges';
import { Timers } from '@/views/Timers';
import { Analytics } from '@/views/Analytics';
import { Calendar } from '@/views/Calendar';
import { Badges } from '@/views/Badges';
import { Settings } from '@/views/Settings';
import type { ViewKey } from '@/types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useApp();
  const [view, setView] = useState<ViewKey>('dashboard');

  const handleVoiceCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase();
    const map: Record<string, ViewKey> = {
      dashboard: 'dashboard',
      home: 'dashboard',
      workout: 'workouts',
      exercise: 'workouts',
      goal: 'goals',
      habit: 'habits',
      challenge: 'challenges',
      timer: 'timers',
      stopwatch: 'timers',
      pomodoro: 'timers',
      analytic: 'analytics',
      stat: 'analytics',
      calendar: 'calendar',
      badge: 'badges',
      reward: 'badges',
      setting: 'settings',
    };
    for (const [key, val] of Object.entries(map)) {
      if (lower.includes(key)) {
        setView(val);
        return;
      }
    }
  }, []);

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar current={view} onNavigate={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar current={view} onVoiceCommand={handleVoiceCommand} />
        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'workouts' && <Workouts />}
          {view === 'goals' && <Goals />}
          {view === 'habits' && <Habits />}
          {view === 'challenges' && <Challenges />}
          {view === 'timers' && <Timers />}
          {view === 'analytics' && <Analytics />}
          {view === 'calendar' && <Calendar />}
          {view === 'badges' && <Badges />}
          {view === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
