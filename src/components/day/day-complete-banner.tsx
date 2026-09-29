'use client';

import Link from 'next/link';
import type { DayMeta } from '@/content/types';
import { useProgress } from '@/lib/progress/store';
import { dayProgress, streak } from '@/lib/progress/selectors';
import { useToday } from '@/lib/use-today';

type Props = {
  meta: DayMeta;
  /** この日を完了すると読めるようになる、目標コードの行数 */
  unlockedLines: number;
  next: { day: number; title: string } | null;
};

/** その日の全項目を達成したときに出す「完了」の表示 */
export function DayCompleteBanner({ meta, unlockedLines, next }: Props) {
  const progress = useProgress();
  const today = useToday();
  const p = dayProgress(meta, progress);
  if (p.status !== 'done') return null;
  const st = streak(progress.activity, today);
  return (
    <div className="rounded-xl border border-good bg-good-soft p-4 sm:p-5" role="status">
      <p className="text-lg font-bold text-good">Day {meta.day} 完了 🎉</p>
      <ul className="mt-2 space-y-1 text-sm">
        {unlockedLines > 0 && <li>解読マップで新しく {unlockedLines} 行が読めるようになりました。</li>}
        <li>
          クイズ {p.quizCorrect}/{p.quizTotal} 問正解・必須演習 {p.requiredPassed}/{p.requiredTotal}
          {p.optionalTotal > 0 && `・任意 ${p.optionalPassed}/${p.optionalTotal}`}
        </li>
        {st.count > 0 && <li>連続学習 {st.count} 日目</li>}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {next ? (
          <Link href={`/days/${next.day}/`} className="rounded-lg bg-good px-4 py-2 text-sm font-semibold text-white">
            明日は Day {next.day}「{next.title}」 →
          </Link>
        ) : null}
        <Link href="/" className="rounded-lg border border-good px-4 py-2 text-sm font-semibold text-good">
          ホームで解読マップを見る
        </Link>
      </div>
    </div>
  );
}
