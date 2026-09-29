import { describe, expect, it } from 'vitest';
import type { DayMeta } from '@/content/types';
import { EMPTY_PROGRESS, type Progress } from '@/lib/progress/types';
import { dayProgress, dueReviewIds, overview, plannedDay, streak } from '@/lib/progress/selectors';
import { addDays, weekStart } from '@/lib/dates';

const meta = (day: number, exam = false): DayMeta => ({
  day,
  level: 1,
  title: `Day ${day}`,
  summary: '',
  minutes: 90,
  goals: [],
  readings: [],
  quizIds: [`day0${day}:a`, `day0${day}:b`],
  exercises: [
    { id: `day0${day}/01`, day, slug: '01', title: '', optional: false, exam: false, typecheck: false },
    { id: `day0${day}/02`, day, slug: '02', title: '', optional: true, exam: false, typecheck: false },
  ],
  exam: exam ? { id: `day0${day}/exam`, title: '', level: 1, passScore: 80, quizIds: [], exercises: [] } : undefined,
});

const withProgress = (patch: Partial<Progress>): Progress => ({ ...EMPTY_PROGRESS, ...patch });

describe('dayProgress', () => {
  it('counts lesson, quiz answers and required exercises (optional excluded)', () => {
    const p = withProgress({
      lessons: { '1': 'x' },
      quiz: { 'day01:a': { choice: 0, correct: false, at: '' } },
      exercises: { 'day01/02': { attempts: 1, passedAt: 'x' } },
    });
    const d = dayProgress(meta(1), p);
    expect(d).toMatchObject({ done: 2, total: 4, status: 'doing', optionalPassed: 1 });
  });

  it('is done only when the exam is passed too', () => {
    const base = {
      lessons: { '1': 'x' },
      quiz: { 'day01:a': { choice: 0, correct: true, at: '' }, 'day01:b': { choice: 1, correct: true, at: '' } },
      exercises: { 'day01/01': { attempts: 1, passedAt: 'x' } },
    };
    expect(dayProgress(meta(1, true), withProgress(base)).status).toBe('doing');
    const passed = withProgress({
      ...base,
      exams: { 'day01/exam': { attempts: 1, best: 90, passedAt: 'x', lastAt: 'x' } },
    });
    expect(dayProgress(meta(1, true), passed).status).toBe('done');
  });

  it('overview picks the first unfinished day', () => {
    const p = withProgress({
      lessons: { '1': 'x' },
      quiz: { 'day01:a': { choice: 0, correct: true, at: '' }, 'day01:b': { choice: 1, correct: true, at: '' } },
      exercises: { 'day01/01': { attempts: 1, passedAt: 'x' } },
    });
    expect(overview([meta(1), meta(2)], p).nextDay).toBe(2);
  });
});

describe('streak', () => {
  const today = '2026-10-08'; // 木曜
  it('counts consecutive days ending today or yesterday', () => {
    expect(streak({ '2026-10-08': 1, '2026-10-07': 2, '2026-10-06': 1 }, today).count).toBe(3);
    expect(streak({ '2026-10-07': 2, '2026-10-06': 1 }, today)).toMatchObject({ count: 2, studiedToday: false });
  });

  it('forgives one missed day per week (freeze)', () => {
    const r = streak({ '2026-10-08': 1, '2026-10-06': 1, '2026-10-05': 1 }, today);
    expect(r.count).toBe(3);
    expect(r.frozen).toEqual(['2026-10-07']);
  });

  it('breaks on two missed days in the same week', () => {
    expect(streak({ '2026-10-08': 1, '2026-10-06': 1, '2026-10-04': 1 }, today).count).toBe(2);
  });

  it('breaks on two consecutive missed days', () => {
    expect(streak({ '2026-10-08': 1, '2026-10-05': 1 }, today).count).toBe(1);
  });
});

describe('dates and review', () => {
  it('weekStart is Monday', () => {
    expect(weekStart('2026-10-08')).toBe('2026-10-05');
    expect(weekStart('2026-10-05')).toBe('2026-10-05');
    expect(weekStart('2026-10-11')).toBe('2026-10-05');
  });

  it('plannedDay counts from the start date', () => {
    expect(plannedDay('2026-10-01', '2026-10-01')).toBe(1);
    expect(plannedDay('2026-10-01', addDays('2026-10-01', 13))).toBe(14);
    expect(plannedDay(null)).toBeNull();
  });

  it('dueReviewIds returns cards due today or earlier, excluding graduated ones', () => {
    const p = withProgress({
      review: {
        a: { box: 1, due: '2026-10-08' },
        b: { box: 2, due: '2026-10-09' },
        c: { box: 4, due: '9999-12-31' },
        d: { box: 3, due: '2026-10-01' },
      },
    });
    expect(dueReviewIds(p, '2026-10-08').sort()).toEqual(['a', 'd']);
  });
});
