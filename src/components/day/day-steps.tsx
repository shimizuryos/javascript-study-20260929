'use client';

import type { DayMeta } from '@/content/types';
import { useProgress } from '@/lib/progress/store';
import { dayProgress } from '@/lib/progress/selectors';
import { CheckIcon, Meter } from '@/components/ui';

/** 日のページ上部の「レッスン → クイズ → 演習 → 試験」進捗 */
export function DaySteps({ meta }: { meta: DayMeta }) {
  const p = dayProgress(meta, useProgress());
  const steps = [
    { href: '#lesson', label: 'レッスン', done: p.lessonRead, detail: p.lessonRead ? '読了' : '未読' },
    {
      href: '#quiz',
      label: 'クイズ',
      done: p.quizTotal > 0 && p.quizAnswered === p.quizTotal,
      detail: `${p.quizAnswered}/${p.quizTotal}`,
    },
    {
      href: '#exercises',
      label: '演習',
      done: p.requiredPassed === p.requiredTotal,
      detail: `${p.requiredPassed}/${p.requiredTotal}${p.optionalTotal ? ` (+任意 ${p.optionalPassed}/${p.optionalTotal})` : ''}`,
    },
    ...(meta.exam
      ? [
          {
            href: '#exam',
            label: '試験',
            done: !!p.examPassed,
            detail: p.examPassed ? '合格' : p.examBest !== null ? `最高 ${p.examBest}%` : '未受験',
          },
        ]
      : []),
  ];
  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <ol className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {steps.map((s, i) => (
          <li key={s.href} className="sm:flex-1">
            <a href={s.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  s.done ? 'bg-good text-white' : 'bg-muted text-ink-2'
                }`}
              >
                {s.done ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block leading-tight font-semibold">{s.label}</span>
                <span className="block text-xs leading-tight text-ink-3">{s.detail}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex items-center gap-2 px-2">
        <Meter
          value={p.ratio}
          color={p.status === 'done' ? 'var(--good)' : 'var(--accent)'}
          label={`Day ${meta.day} の進捗`}
        />
        <span className="w-9 shrink-0 text-right text-xs text-ink-2 tabular-nums">{Math.round(p.ratio * 100)}%</span>
      </div>
    </div>
  );
}
