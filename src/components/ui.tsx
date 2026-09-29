import type { Level } from '@/content/types';
import { LEVELS } from '@/content/types';

export function LevelDot({ level, className = '' }: { level: Level; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-2.5 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: `var(--level-${level})` }}
    />
  );
}

export function LevelTag({ level }: { level: Level }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <LevelDot level={level} />
      Level {level}・{LEVELS[level].short}
    </span>
  );
}

type BadgeTone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad';
const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-ink-2 border-line',
  accent: 'bg-accent-soft text-accent-strong border-transparent',
  good: 'bg-good-soft text-good border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  bad: 'bg-bad-soft text-bad border-transparent',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/** 割合を示すメーター (トラックは同系色の薄い色) */
export function Meter({
  value,
  color = 'var(--accent)',
  label,
  className = '',
}: {
  value: number;
  color?: string;
  label: string;
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`h-2 w-full overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` }}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-card p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function CheckIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
