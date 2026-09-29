'use client';

import Link from 'next/link';
import type { DayMeta } from '@/content/types';
import { LEVELS } from '@/content/types';
import { useProgress } from '@/lib/progress/store';
import { Badge, CheckIcon } from '@/components/ui';

export function ExamCard({ day, exam }: { day: number; exam: NonNullable<DayMeta['exam']> }) {
  const record = useProgress().exams[exam.id];
  return (
    <Link
      href={`/days/${day}/exam/`}
      className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-card p-4 transition-colors hover:border-line-strong"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-3">{LEVELS[exam.level].name}</p>
        <p className="font-semibold">{exam.title}</p>
        <p className="mt-1 text-xs text-ink-2">
          選択問題 {exam.quizIds.length} 問 + 演習 {exam.exercises.length} 問・合格ライン {exam.passScore}%
        </p>
      </div>
      {record?.passedAt ? (
        <Badge tone="good">
          <CheckIcon className="size-3" /> 合格 (最高 {record.best}%)
        </Badge>
      ) : record ? (
        <Badge tone="warn">最高 {record.best}% — 再挑戦</Badge>
      ) : (
        <span className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">受験する →</span>
      )}
    </Link>
  );
}
