import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Dumbbell, Target, Repeat, Trophy,
  Timer, BarChart3, Calendar, Award, Settings,
} from 'lucide-react';
import type { ViewKey } from '@/types';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'workouts', label: 'Workouts', icon: Dumbbell },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'habits', label: 'Habits', icon: Repeat },
  { key: 'challenges', label: 'Challenges', icon: Trophy },
  { key: 'timers', label: 'Timers', icon: Timer },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'badges', label: 'Badges', icon: Award },
  { key: 'settings', label: 'Settings', icon: Settings },
];
