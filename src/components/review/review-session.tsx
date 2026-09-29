'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { QuizQuestion } from '@/content/types';
import { progressActions, useProgress, useProgressReady } from '@/lib/progress/store';
import { dueReviewIds } from '@/lib/progress/selectors';
import { addDays } from '@/lib/dates';
import { useToday } from '@/lib/use-today';
import { Badge, Card } from '@/components/ui';
import { QuestionCard } from '@/components/quiz/question-card';

type Q = QuizQuestion & { day: number; source: string };

export function ReviewSession({ questions }: { questions: Q[] }) {
  const progress = useProgress();
  const ready = useProgressReady();
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const today = useToday();
  // セッション開始時点の出題リストを固定する (回答すると due が先に延びて一覧から消えるため)
  const [queue, setQueue] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);

  const due = dueReviewIds(progress, today).filter((id) => byId.has(id));
  const cards = Object.entries(progress.review).filter(([id]) => byId.has(id));
  const upcoming = [1, 3, 7].map((n) => ({
    label: n === 1 ? '明日' : `${n} 日以内`,
    count: cards.filter(([, c]) => c.box < 4 && c.due > today && c.due <= addDays(today, n)).length,
  }));
  const graduated = cards.filter(([, c]) => c.box === 4).length;

  if (!ready) return null;

  if (queue === null) {
    return (
      <div className="space-y-4">
        <Card>
          <p className="text-sm text-ink-2">今日の復習</p>
          <p className="text-4xl font-bold tabular-nums">{due.length} 問</p>
          <p className="mt-2 text-sm text-ink-2">
            クイズや試験で間違えた問題が、1 日後 → 3 日後 → 7 日後と間隔をあけて出題されます。3 回続けて正解すると「卒業」です。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {upcoming.map((u) => (
              <Badge key={u.label}>
                {u.label}: {u.count} 問
              </Badge>
            ))}
            <Badge tone="good">卒業: {graduated} 問</Badge>
          </div>
          {due.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQueue(due);
                setIndex(0);
                setChoice(null);
              }}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
            >
              復習を始める →
            </button>
          ) : (
            <p className="mt-4 text-sm text-ink-3">
              今日の復習はありません。{cards.length === 0 && 'クイズで間違えた問題がここに溜まっていきます。'}
            </p>
          )}
        </Card>
      </div>
    );
  }

  const id = queue[index];
  const q = id ? byId.get(id) : undefined;
  if (!q) {
    return (
      <Card>
        <p className="text-lg font-bold">今日の復習は完了です 👏</p>
        <p className="mt-1 text-sm text-ink-2">{queue.length} 問を復習しました。</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent-strong underline">
          ホームへ戻る
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-ink-2">
        <span>
          {index + 1} / {queue.length} 問目
        </span>
        <Link href={`/days/${q.day}/`} className="text-accent-strong underline underline-offset-2">
          出典: {q.source}
        </Link>
      </div>
      <QuestionCard
        question={q}
        selected={choice}
        revealed={choice !== null}
        onSelect={(c) => {
          setChoice(c);
          progressActions.answerReview(q.id, q.options[c].correct);
        }}
      />
      {choice !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIndex((i) => i + 1);
              setChoice(null);
            }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
