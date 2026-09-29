import type { DayMeta, ExerciseSummary, Level } from '@/content/types';
import { addDays, diffDays, todayKey, weekStart } from '../dates';
import type { Progress } from './types';

export type DayStatus = 'todo' | 'doing' | 'done';

export type DayProgress = {
  day: number;
  lessonRead: boolean;
  quizAnswered: number;
  quizCorrect: number;
  quizTotal: number;
  requiredPassed: number;
  requiredTotal: number;
  optionalPassed: number;
  optionalTotal: number;
  examPassed: boolean | null;
  examBest: number | null;
  done: number;
  total: number;
  ratio: number;
  status: DayStatus;
};

export const isPassed = (p: Progress, id: string) => !!p.exercises[id]?.passedAt;

export function dayProgress(meta: DayMeta, p: Progress): DayProgress {
  const lessonRead = !!p.lessons[String(meta.day)];
  const answered = meta.quizIds.filter((id) => p.quiz[id]);
  const quizCorrect = answered.filter((id) => p.quiz[id].correct).length;
  const required = meta.exercises.filter((e) => !e.optional);
  const optional = meta.exercises.filter((e) => e.optional);
  const requiredPassed = required.filter((e) => isPassed(p, e.id)).length;
  const optionalPassed = optional.filter((e) => isPassed(p, e.id)).length;
  const exam = meta.exam ? p.exams[meta.exam.id] : undefined;
  const examPassed = meta.exam ? !!exam?.passedAt : null;
  const done = (lessonRead ? 1 : 0) + answered.length + requiredPassed + (examPassed ? 1 : 0);
  const total = 1 + meta.quizIds.length + required.length + (meta.exam ? 1 : 0);
  const touched =
    done > 0 || meta.exercises.some((e) => p.exercises[e.id]) || (meta.exam ? !!exam : false);
  return {
    day: meta.day,
    lessonRead,
    quizAnswered: answered.length,
    quizCorrect,
    quizTotal: meta.quizIds.length,
    requiredPassed,
    requiredTotal: required.length,
    optionalPassed,
    optionalTotal: optional.length,
    examPassed,
    examBest: exam?.best ?? null,
    done,
    total,
    ratio: total === 0 ? 0 : done / total,
    status: done === total ? 'done' : touched ? 'doing' : 'todo',
  };
}

export type Overview = {
  days: DayProgress[];
  ratio: number;
  daysDone: number;
  exercisesPassed: number;
  exercisesTotal: number;
  examsPassed: number;
  examsTotal: number;
  byLevel: { level: Level; done: number; total: number }[];
  nextDay: number | null;
};

export function overview(metas: DayMeta[], p: Progress): Overview {
  const days = metas.map((m) => dayProgress(m, p));
  const done = days.reduce((s, d) => s + d.done, 0);
  const total = days.reduce((s, d) => s + d.total, 0);
  const allExercises = metas.flatMap((m) => m.exercises.filter((e) => !e.optional));
  const levels = [...new Set(metas.map((m) => m.level))].sort() as Level[];
  return {
    days,
    ratio: total === 0 ? 0 : done / total,
    daysDone: days.filter((d) => d.status === 'done').length,
    exercisesPassed: allExercises.filter((e) => isPassed(p, e.id)).length,
    exercisesTotal: allExercises.length,
    examsPassed: metas.filter((m) => m.exam && p.exams[m.exam.id]?.passedAt).length,
    examsTotal: metas.filter((m) => m.exam).length,
    byLevel: levels.map((level) => {
      const ds = days.filter((_, i) => metas[i].level === level);
      return { level, done: ds.reduce((s, d) => s + d.done, 0), total: ds.reduce((s, d) => s + d.total, 0) };
    }),
    nextDay: days.find((d) => d.status !== 'done')?.day ?? null,
  };
}

/** 連続学習日数。週に 1 日までは休んでも途切れない (フリーズ) */
export function streak(activity: Record<string, number>, today = todayKey()) {
  let count = 0;
  let cursor = activity[today] ? today : addDays(today, -1);
  const frozen: string[] = [];
  const usedWeeks = new Set<string>();
  for (let guard = 0; guard < 400; guard++) {
    if (activity[cursor]) {
      count++;
      cursor = addDays(cursor, -1);
      continue;
    }
    const prev = addDays(cursor, -1);
    const week = weekStart(cursor);
    if (activity[prev] && !usedWeeks.has(week)) {
      usedWeeks.add(week);
      frozen.push(cursor);
      cursor = prev;
      continue;
    }
    break;
  }
  return { count, frozen, studiedToday: !!activity[today] };
}

/** 学習開始日から見た「今日は何日目の予定か」 (1 始まり) */
export function plannedDay(startDate: string | null, today = todayKey()): number | null {
  if (!startDate) return null;
  return diffDays(startDate, today) + 1;
}

export function exerciseStatus(p: Progress, e: ExerciseSummary): 'todo' | 'tried' | 'passed' {
  const ep = p.exercises[e.id];
  if (ep?.passedAt) return 'passed';
  if (ep) return 'tried';
  return 'todo';
}

export function dueReviewIds(p: Progress, today = todayKey()): string[] {
  return Object.entries(p.review)
    .filter(([, card]) => card.box < 4 && card.due <= today)
    .map(([id]) => id);
}
