import { useEffect, useState } from 'react';
import { NAV_ITEMS } from './navConfig';
import { useApp } from '@/lib/store';
import { useAuth } from '@/lib/auth';
import { Dumbbell, Moon, Sun, Menu, X, Flame, Zap, LogOut } from 'lucide-react';
import type { ViewKey } from '@/types';

interface SidebarProps {
  current: ViewKey;
  onNavigate: (v: ViewKey) => void;
}

export function Sidebar({ current, onNavigate }: SidebarProps) {
  const { data, updateSettings } = useApp();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = data.settings.darkMode;

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  const handleNav = (v: ViewKey) => {
    onNavigate(v);
    setMobileOpen(false);
  };

  const NavList = () => (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = current === item.key;
        return (
          <button
            key={item.key}
            onClick={() => handleNav(item.key)}
            className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <Icon size={18} className={active ? 'shrink-0' : 'shrink-0'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const ProfileCard = () => (
    <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur">
          {data.profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{data.profile.name}</p>
          <p className="text-xs text-primary-100">{data.profile.rank} · Lvl {data.profile.level}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-primary-100 mb-1">
          <span>{data.profile.xp} XP</span>
          <span>{data.profile.xpToNext} XP</span>
        </div>
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${Math.min(100, (data.profile.xp / data.profile.xpToNext) * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <Flame size={13} className="text-accent-400" />
            {data.profile.streak} day streak
          </span>
          <span className="flex items-center gap-1">
            <Zap size={13} className="text-yellow-300" />
            {data.profile.totalXp} XP
          </span>
        </div>
      </div>
      <button
        onClick={() => signOut()}
        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 py-2 text-xs font-semibold text-white transition-colors"
      >
        <LogOut size={13} /> Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Dumbbell size={18} />
          </div>
          <span className="font-display font-bold text-base">FitTrack</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateSettings({ darkMode: !dark })}
            className="btn-ghost p-2"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Dumbbell size={18} />
                </div>
                <span className="font-display font-bold text-base">FitTrack</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              <NavList />
            </div>
            <ProfileCard />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shrink-0">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/30">
            <Dumbbell size={20} />
          </div>
          <span className="font-display font-bold text-lg">FitTrack</span>
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <NavList />
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-2">
          <ProfileCard />
        </div>
      </aside>
    </>
  );
}
