import { useApp } from '@/lib/store';
import * as Icons from 'lucide-react';
import type { Badge } from '@/types';

const TIER_STYLES: Record<Badge['tier'], { ring: string; bg: string; text: string; label: string }> = {
  bronze: { ring: 'ring-amber-700/30', bg: 'bg-amber-50 dark:bg-amber-700/10', text: 'text-amber-700 dark:text-amber-500', label: 'Bronze' },
  silver: { ring: 'ring-slate-400/30', bg: 'bg-slate-50 dark:bg-slate-400/10', text: 'text-slate-600 dark:text-slate-300', label: 'Silver' },
  gold: { ring: 'ring-yellow-500/30', bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-500', label: 'Gold' },
  platinum: { ring: 'ring-cyan-400/30', bg: 'bg-cyan-50 dark:bg-cyan-400/10', text: 'text-cyan-700 dark:text-cyan-400', label: 'Platinum' },
};

export function Badges() {
  const { data } = useApp();
  const unlocked = data.badges.filter((b) => b.unlocked);
  const locked = data.badges.filter((b) => !b.unlocked);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="card p-5 bg-gradient-to-br from-yellow-500 to-accent-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">Badges Earned</p>
            <h2 className="font-display text-3xl font-bold mt-0.5">{unlocked.length} / {data.badges.length}</h2>
            <p className="text-yellow-100 text-sm mt-1">Keep grinding to unlock them all!</p>
          </div>
          <Icons.Award size={56} className="text-white/80" />
        </div>
        <div className="mt-4 h-2.5 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(unlocked.length / data.badges.length) * 100}%` }} />
        </div>
      </div>

      {/* Unlocked badges */}
      {unlocked.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Unlocked</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {unlocked.map((b) => {
              const Icon = (Icons as any)[b.icon] || Icons.Award;
              const tier = TIER_STYLES[b.tier];
              return (
                <div key={b.id} className={`card p-4 ring-2 ${tier.ring} ${tier.bg} flex flex-col items-center text-center animate-count-up`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tier.bg} ${tier.text} mb-2`}>
                    <Icon size={28} />
                  </div>
                  <h4 className="font-semibold text-sm">{b.name}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{b.description}</p>
                  <span className={`badge-pill mt-2 ${tier.bg} ${tier.text}`}>{tier.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">Locked</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {locked.map((b) => {
              const Icon = (Icons as any)[b.icon] || Icons.Award;
              const tier = TIER_STYLES[b.tier];
              return (
                <div key={b.id} className="card p-4 flex flex-col items-center text-center opacity-50">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 mb-2 relative`}>
                    <Icon size={28} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icons.Lock size={16} className="text-neutral-500 dark:text-neutral-400" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm">{b.name}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{b.description}</p>
                  <span className={`badge-pill mt-2 ${tier.bg} ${tier.text}`}>{tier.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
