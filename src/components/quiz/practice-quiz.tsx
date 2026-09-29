'use client';

import type { QuizQuestion } from '@/content/types';
import { progressActions, useProgress } from '@/lib/progress/store';
import { QuestionCard } from './question-card';

/** 通常のクイズ: 選んだらすぐ正誤と解説を表示。間違えた問題は復習キューへ入る */
export function PracticeQuiz({ questions }: { questions: QuizQuestion[] }) {
  const progress = useProgress();
  const answered = questions.filter((q) => progress.quiz[q.id]);
  const correct = answered.filter((q) => progress.quiz[q.id].correct).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-ink-2">
          回答 {answered.length} / {questions.length}・正解 <strong className="text-ink">{correct}</strong>
        </span>
        {answered.length > 0 && (
          <button
            type="button"
            onClick={() => progressActions.resetQuiz(questions.map((q) => q.id))}
            className="rounded-md border border-line px-2.5 py-1 text-xs text-ink-2 hover:bg-muted"
          >
            もう一度解く
          </button>
        )}
      </div>
      {questions.map((q, i) => {
        const a = progress.quiz[q.id];
        return (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            selected={a?.choice ?? null}
            revealed={!!a}
            reviewNote
            onSelect={(choice) => progressActions.answerQuiz(q.id, choice, q.options[choice].correct)}
          />
        );
      })}
      {answered.length === questions.length && questions.length > 0 && (
        <p className="rounded-lg bg-muted p-3 text-sm text-ink-2">
          {correct === questions.length
            ? '全問正解です! 演習に進みましょう。'
            : `間違えた ${questions.length - correct} 問は「復習」に入りました。明日以降に出題されます。`}
        </p>
      )}
    </div>
  );
}
