import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllDayMeta, getAllExerciseSummaries } from '@/lib/content';
import { ExercisesTable } from '@/components/exercises/exercises-table';

export const metadata: Metadata = { title: '演習一覧' };

export default function ExercisesPage() {
  const days = getAllDayMeta().map(({ day, level, title }) => ({ day, level, title }));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">演習一覧</h1>
      {/* nuqs は内部で useSearchParams を使うので、静的生成では Suspense で囲む (Day 10) */}
      <Suspense fallback={<p className="text-sm text-ink-3">読み込み中…</p>}>
        <ExercisesTable exercises={getAllExerciseSummaries()} days={days} />
      </Suspense>
    </div>
  );
}
