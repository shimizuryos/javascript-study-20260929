'use client';

import Link from 'next/link';
import type { ExerciseSummary } from '@/content/types';
import { useProgress } from '@/lib/progress/store';
import { exerciseStatus } from '@/lib/progress/selectors';
import { Badge, CheckIcon } from '@/components/ui';

export function exerciseHref(e: Pick<ExerciseSummary, 'day' | 'slug' | 'exam'>) {
  return e.exam ? `/days/${e.day}/exam/exercises/${e.slug}/` : `/days/${e.day}/exercises/${e.slug}/`;
}

export function ExerciseList({ exercises }: { exercises: ExerciseSummary[] }) {
  const progress = useProgress();
  return (
    <ol className="grid gap-2">
      {exercises.map((e, i) => {
        const status = exerciseStatus(progress, e);
        return (
          <li key={e.id}>
            <Link
              href={exerciseHref(e)}
              className="flex items-center gap-3 rounded-lg border border-line bg-card px-4 py-3 transition-colors hover:border-line-strong"
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  status === 'passed' ? 'bg-good text-white' : 'bg-muted text-ink-2'
                }`}
              >
                {status === 'passed' ? <CheckIcon /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{e.title}</span>
                <span className="mt-0.5 flex flex-wrap gap-1">
                  {e.optional ? <Badge>任意</Badge> : <Badge tone="accent">必須</Badge>}
                  {e.typecheck && <Badge>型チェック</Badge>}
                  {status === 'tried' && <Badge tone="warn">挑戦中</Badge>}
                  {status === 'passed' && progress.exercises[e.id]?.revealed && !progress.exercises[e.id]?.passedBeforeReveal && (
                    <Badge>解答を見た</Badge>
                  )}
                </span>
              </span>
              <span aria-hidden className="text-ink-3">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
