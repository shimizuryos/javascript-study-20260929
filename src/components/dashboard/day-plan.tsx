'use client';

import Link from 'next/link';
import type { DayMeta } from '@/content/types';
import type { DayProgress } from '@/lib/progress/selectors';
import { addDays, formatJa } from '@/lib/dates';
import { Badge, CheckIcon, LevelDot, Meter } from '@/components/ui';

type Props = {
  metas: DayMeta[];
  days: DayProgress[];
  startDate: string | null;
  today: string;
  nextDay: number | null;
};

const STATUS_LABEL = { todo: '未着手', doing: '学習中', done: '完了' } as const;

export function DayPlan({ metas, days, startDate, today, nextDay }: Props) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {metas.map((m, i) => {
        const p = days[i];
        const planned = startDate ? addDays(startDate, m.day - 1) : null;
        const late = planned !== null && planned < today && p.status !== 'done';
        const isNext = m.day === nextDay;
        return (
          <li key={m.day}>
            <Link
              href={`/days/${m.day}/`}
              className={`flex h-full flex-col gap-2 rounded-lg border bg-card p-3 transition-colors hover:border-line-strong ${
                isNext ? 'border-accent ring-1 ring-accent' : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-ink-2">
                  <LevelDot level={m.level} />
                  Day {m.day}
                  {planned && <span className="font-normal text-ink-3">・{formatJa(planned)}</span>}
                </span>
                <span className="flex items-center gap-1">
                  {m.exam && <Badge tone={p.examPassed ? 'good' : 'warn'}>{p.examPassed ? '試験合格' : '試験あり'}</Badge>}
                  {p.status === 'done' ? (
                    <Badge tone="good">
                      <CheckIcon className="size-3" />
                      完了
                    </Badge>
                  ) : late ? (
                    <Badge tone="warn">遅れ</Badge>
                  ) : (
                    <span className="text-ink-3">{STATUS_LABEL[p.status]}</span>
                  )}
                </span>
              </div>
              <p className="text-sm leading-snug font-semibold">{m.title}</p>
              <div className="mt-auto flex items-center gap-2">
                <Meter
                  value={p.ratio}
                  color={p.status === 'done' ? 'var(--good)' : 'var(--accent)'}
                  label={`Day ${m.day} の進捗`}
                />
                <span className="w-9 shrink-0 text-right text-xs text-ink-2 tabular-nums">{Math.round(p.ratio * 100)}%</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
