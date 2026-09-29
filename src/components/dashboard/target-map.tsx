'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { TargetCode } from '@/content/types';
import { Badge, Meter } from '@/components/ui';

type Props = {
  target: TargetCode;
  doneDays: Set<number>;
  nextDay: number | null;
};

/**
 * 目標コードの「解読マップ」。学んだ日が完了すると、その日に対応する行が色づく。
 * 行をクリックすると、その行で使われている文法の説明が見られる。
 */
export function TargetMap({ target, doneDays, nextDay }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const lineInfo = useMemo(() => {
    const info = new Map<number, (typeof target.segments)[number]>();
    for (const s of target.segments) for (let l = s.from; l <= s.to; l++) info.set(l, s);
    return info;
  }, [target]);

  const covered = [...lineInfo.keys()];
  const decodedCount = covered.filter((l) => doneDays.has(lineInfo.get(l)!.day)).length;
  const unlockNext = nextDay === null ? 0 : covered.filter((l) => lineInfo.get(l)!.day === nextDay).length;
  const appearsNext = nextDay === null ? 0 : covered.filter((l) => lineInfo.get(l)!.also?.includes(nextDay)).length;

  const css = useMemo(() => {
    const rules: string[] = [];
    for (const [line, seg] of lineInfo) {
      const cls = doneDays.has(seg.day)
        ? 'decoded'
        : seg.day === nextDay
          ? 'active'
          : nextDay !== null && seg.also?.includes(nextDay)
            ? 'appears'
            : 'locked';
      const sel = `.target-code .line[data-line="${line}"]`;
      if (cls === 'decoded') rules.push(`${sel}{border-left-color:var(--good);background:var(--good-soft)}`);
      if (cls === 'active') rules.push(`${sel}{border-left-color:var(--accent);background:var(--accent-soft)}`);
      if (cls === 'appears') rules.push(`${sel}{border-left:3px dashed var(--accent);opacity:.85}`);
      if (cls === 'locked') rules.push(`${sel}{opacity:.4}`);
      rules.push(`${sel}{cursor:pointer}`);
    }
    if (selected !== null) {
      const seg = lineInfo.get(selected);
      if (seg) {
        for (let l = seg.from; l <= seg.to; l++) {
          rules.push(
            `.target-code .line[data-line="${l}"]{opacity:1;outline:1px solid var(--accent);outline-offset:-1px}`,
          );
        }
      }
    }
    return rules.join('\n');
  }, [lineInfo, doneDays, nextDay, selected]);

  const selectedSeg = selected !== null ? lineInfo.get(selected) : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <code className="font-mono text-ink-2">{target.fileName}</code>
          <span className="text-ink-2">
            解読済み <strong className="text-ink">{decodedCount}</strong> / {covered.length} 行
          </span>
          <span className="flex items-center gap-3 text-xs text-ink-3">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-1 rounded-sm bg-good" aria-hidden /> 読める
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-1 rounded-sm bg-accent" aria-hidden /> 次の Day で読める
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-0 border-l-[3px] border-dashed border-accent" aria-hidden /> 次の Day
              の文法が登場
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-1 rounded-sm bg-line-strong" aria-hidden /> まだ
            </span>
          </span>
        </div>
        <Meter
          value={covered.length ? decodedCount / covered.length : 0}
          color="var(--good)"
          label="解読済みの行の割合"
          className="mb-2"
        />
        {nextDay !== null && (unlockNext > 0 || appearsNext > 0) && (
          <p className="mb-3 text-xs text-ink-2">
            Day {nextDay} を終えると
            {unlockNext > 0 ? <strong className="mx-1 text-ink">+{unlockNext} 行</strong> : ' '}
            {unlockNext > 0 ? '読めるようになります。' : ''}
            {appearsNext > 0 && `Day ${nextDay} の文法は ${appearsNext} 行に登場します (点線)。`}
          </p>
        )}
        <style>{css}</style>
        <div
          className="target-code overflow-x-auto rounded-lg border border-line bg-code py-2 font-mono text-[12.5px] leading-[1.6]"
          onClick={(e) => {
            const el = (e.target as HTMLElement).closest('[data-line]');
            if (el) setSelected(Number(el.getAttribute('data-line')));
          }}
          dangerouslySetInnerHTML={{ __html: target.html }}
        />
      </div>
      <aside
        className="rounded-lg border border-line bg-bg p-4 text-sm lg:sticky lg:top-20 lg:self-start"
        aria-live="polite"
      >
        {selectedSeg ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone={doneDays.has(selectedSeg.day) ? 'good' : 'neutral'}>Day {selectedSeg.day}</Badge>
              <span className="text-xs text-ink-3">
                {selectedSeg.from === selectedSeg.to
                  ? `${selectedSeg.from} 行目`
                  : `${selectedSeg.from}〜${selectedSeg.to} 行目`}
              </span>
            </div>
            <p className="leading-relaxed">{selectedSeg.note}</p>
            {selectedSeg.also && selectedSeg.also.length > 0 && (
              <p className="mt-2 text-xs text-ink-3">
                この行には Day {selectedSeg.also.join('・')} の文法も登場します。
              </p>
            )}
            <Link
              href={`/days/${selectedSeg.day}/`}
              className="mt-3 inline-block text-accent-strong underline underline-offset-2"
            >
              Day {selectedSeg.day} を開く →
            </Link>
          </>
        ) : (
          <p className="text-ink-2">
            2
            週間後に読めるようになりたいコードです。行をクリックすると、何日目に学ぶ内容か・何をしているかが表示されます。日を完了するたびに、対応する行が緑色になります。
          </p>
        )}
      </aside>
    </div>
  );
}
