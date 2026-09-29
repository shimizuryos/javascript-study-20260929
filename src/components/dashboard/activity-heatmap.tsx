'use client';

import { useState } from 'react';
import { addDays, formatJa, weekStart } from '@/lib/dates';
import { useToday } from '@/lib/use-today';

const WEEKS = 6;
const ROW_LABELS = ['月', '', '水', '', '金', '', '日'];

function level(count: number) {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 8) return 2;
  if (count <= 15) return 3;
  return 4;
}

/** 直近 6 週間の学習量 (1 色の濃淡)。セルにカーソルを合わせると日付と回数が出る */
export function ActivityHeatmap({ activity, frozen }: { activity: Record<string, number>; frozen: string[] }) {
  const today = useToday();
  const start = addDays(weekStart(today), -7 * (WEEKS - 1));
  const [hover, setHover] = useState<string | null>(null);
  const frozenSet = new Set(frozen);

  const columns = Array.from({ length: WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  const hoverCount = hover ? (activity[hover] ?? 0) : 0;

  return (
    <div>
      <div className="flex gap-[3px]" role="grid" aria-label="直近 6 週間の学習記録">
        <div className="mr-1 grid grid-rows-7 gap-[3px] text-[10px] leading-[14px] text-ink-3" aria-hidden>
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="h-[14px]">
              {l}
            </span>
          ))}
        </div>
        {columns.map((col, i) => (
          <div key={i} className="grid grid-rows-7 gap-[3px]" role="row">
            {col.map((date) => {
              const future = date > today;
              const count = activity[date] ?? 0;
              return (
                <div
                  key={date}
                  role="gridcell"
                  aria-label={`${formatJa(date)} ${future ? '' : `${count} 回`}${frozenSet.has(date) ? ' (フリーズ)' : ''}`}
                  onMouseEnter={() => setHover(date)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(date)}
                  onBlur={() => setHover(null)}
                  tabIndex={future ? -1 : 0}
                  className={`size-[14px] rounded-[3px] ${date === today ? 'ring-1 ring-ink-2' : ''}`}
                  style={{
                    backgroundColor: future ? 'transparent' : `var(--heat-${level(count)})`,
                    outline: frozenSet.has(date) ? '1px dashed var(--accent)' : undefined,
                    outlineOffset: -1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex min-h-5 flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
        <span aria-live="polite">
          {hover ? (
            <>
              <span className="text-ink">{formatJa(hover)}</span>・{hoverCount} 回{frozenSet.has(hover) ? '・フリーズで継続' : ''}
            </>
          ) : (
            '1 マス = 1 日 (レッスン・クイズ・演習の実行回数)'
          )}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          少
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="size-[10px] rounded-[2px]" style={{ backgroundColor: `var(--heat-${l})` }} />
          ))}
          多
        </span>
      </div>
    </div>
  );
}
