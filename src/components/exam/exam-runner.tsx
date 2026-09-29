'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Exam } from '@/content/types';
import type { Progress } from '@/lib/progress/types';
import { progressActions, useProgress } from '@/lib/progress/store';
import { Badge, Card, CheckIcon, Meter } from '@/components/ui';
import { QuestionCard } from '@/components/quiz/question-card';
import { exerciseHref } from '@/components/day/exercise-list';

const EXERCISE_POINTS = 3;

/** 解答を見ずに合格した演習だけが得点になる */
function exercisePoints(p: Progress, id: string) {
  const e = p.exercises[id];
  if (!e?.passedAt) return 0;
  return e.passedBeforeReveal || !e.revealed ? EXERCISE_POINTS : 0;
}

export function ExamRunner({ exam }: { exam: Exam }) {
  const progress = useProgress();
  const record = progress.exams[exam.id];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<null | { score: number; quizCorrect: number; exPoints: number }>(null);

  const exMax = exam.exercises.length * EXERCISE_POINTS;
  const exNow = exam.exercises.reduce((s, e) => s + exercisePoints(progress, e.id), 0);
  const answeredCount = Object.keys(answers).length;

  const grade = () => {
    const unanswered = exam.quiz.length - answeredCount;
    if (unanswered > 0 && !window.confirm(`未回答が ${unanswered} 問あります (不正解として扱います)。採点しますか?`))
      return;
    const correctIds = exam.quiz
      .filter((q) => answers[q.id] !== undefined && q.options[answers[q.id]].correct)
      .map((q) => q.id);
    const wrongIds = exam.quiz.map((q) => q.id).filter((id) => !correctIds.includes(id));
    const total = exam.quiz.length + exMax;
    const score = total === 0 ? 0 : Math.round(((correctIds.length + exNow) / total) * 100);
    progressActions.recordExam(exam.id, score, exam.passScore, answers, wrongIds);
    setGraded({ score, quizCorrect: correctIds.length, exPoints: exNow });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retry = () => {
    setAnswers({});
    setGraded(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {graded && (
        <Card className={graded.score >= exam.passScore ? 'border-good' : 'border-bad'}>
          <p className="text-sm text-ink-2">今回の得点</p>
          <p className="text-5xl font-bold tabular-nums">
            {graded.score}
            <span className="text-2xl">%</span>
          </p>
          <Meter
            value={graded.score / 100}
            color={graded.score >= exam.passScore ? 'var(--good)' : 'var(--bad)'}
            label="試験の得点"
            className="mt-3"
          />
          <p className="mt-3 font-semibold">
            {graded.score >= exam.passScore
              ? '合格です! 🎉'
              : `不合格 (合格ライン ${exam.passScore}%)。解説を読んで再挑戦しましょう。`}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-2">
            <li>
              選択問題: {graded.quizCorrect} / {exam.quiz.length} 問正解 (1 問 1 点)
            </li>
            <li>
              演習: {graded.exPoints} / {exMax} 点 (1 問 {EXERCISE_POINTS} 点・解答を見た問題は 0 点)
            </li>
            <li>間違えた選択問題は「復習」に追加されました。</li>
          </ul>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm hover:bg-muted"
          >
            もう一度受ける
          </button>
        </Card>
      )}

      {!graded && record && (
        <p className="rounded-lg bg-muted p-3 text-sm text-ink-2">
          これまでの最高得点: <strong className="text-ink">{record.best}%</strong>
          {record.passedAt ? '（合格済み）' : ''}・受験回数 {record.attempts} 回
        </p>
      )}

      <section>
        <h2 className="mb-1 text-lg font-bold">
          第 1 部: 演習 ({exam.exercises.length} 問・各 {EXERCISE_POINTS} 点)
        </h2>
        <p className="mb-3 text-sm text-ink-2">
          先に演習を解いてから、第 2 部の選択問題に答えて「採点する」を押してください。
        </p>
        <ol className="grid gap-2">
          {exam.exercises.map((e, i) => {
            const pts = exercisePoints(progress, e.id);
            const rec = progress.exercises[e.id];
            return (
              <li key={e.id}>
                <Link
                  href={exerciseHref(e)}
                  className="flex items-center gap-3 rounded-lg border border-line bg-card px-4 py-3 hover:border-line-strong"
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      pts > 0 ? 'bg-good text-white' : 'bg-muted text-ink-2'
                    }`}
                  >
                    {pts > 0 ? <CheckIcon /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold">{e.title}</span>
                  {rec?.passedAt && pts === 0 ? (
                    <Badge>解答を見たため 0 点</Badge>
                  ) : pts > 0 ? (
                    <Badge tone="good">{pts} 点</Badge>
                  ) : rec ? (
                    <Badge tone="warn">挑戦中</Badge>
                  ) : (
                    <Badge>未着手</Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">第 2 部: 選択問題 ({exam.quiz.length} 問・各 1 点)</h2>
        <p className="mb-3 text-sm text-ink-2">
          {graded
            ? '正解と解説を確認しましょう。'
            : `採点するまで正誤は表示されません。回答 ${answeredCount} / ${exam.quiz.length}`}
        </p>
        <div className="space-y-4">
          {exam.quiz.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              selected={answers[q.id] ?? null}
              revealed={!!graded}
              reviewNote={!!graded}
              onSelect={(choice) => setAnswers((a) => ({ ...a, [q.id]: choice }))}
            />
          ))}
        </div>
      </section>

      {!graded && (
        <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-card/95 p-3 shadow-lg backdrop-blur">
          <span className="text-sm text-ink-2">
            選択問題 {answeredCount}/{exam.quiz.length}・演習 {exNow}/{exMax} 点
          </span>
          <button
            type="button"
            onClick={grade}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            採点する
          </button>
        </div>
      )}
    </div>
  );
}
