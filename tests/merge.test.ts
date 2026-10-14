import { describe, expect, it } from 'vitest';
import { mergeProgress, sameProgress } from '@/lib/progress/merge';
import { EMPTY_PROGRESS, quizAnswer, type Progress } from '@/lib/progress/types';

const p = (patch: Partial<Progress>): Progress => ({ ...EMPTY_PROGRESS, ...patch });

/** ランダムな進捗を作る (乱数の種を固定して毎回同じ) */
function randomProgress(seed: number): Progress {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const pick = <T>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
  const ts = () => `2026-10-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}T00:00:00.000Z`;
  const ids = ['a', 'b', 'c', 'd'];
  const out = p({ startDate: rnd() < 0.5 ? null : ts().slice(0, 10) });
  for (const id of ids) {
    if (rnd() < 0.5) out.lessons[id] = ts();
    if (rnd() < 0.6)
      out.quiz[id] = {
        choice: Math.floor(rnd() * 4),
        correct: rnd() < 0.5,
        at: ts(),
        ...(rnd() < 0.2 ? { cleared: true } : {}),
      };
    if (rnd() < 0.6)
      out.exercises[id] = {
        attempts: Math.floor(rnd() * 5),
        ...(rnd() < 0.5 ? { passedAt: ts() } : {}),
        ...(rnd() < 0.3 ? { revealed: true } : {}),
      };
    if (rnd() < 0.3)
      out.exams[id] = {
        attempts: 1 + Math.floor(rnd() * 3),
        best: Math.floor(rnd() * 100),
        lastAt: ts(),
        answers: { [id]: 1 },
      };
    if (rnd() < 0.5)
      out.review[id] = {
        box: pick([1, 2, 3, 4] as const),
        due: ts().slice(0, 10),
        ...(rnd() < 0.5 ? { updatedAt: ts() } : {}),
      };
    if (rnd() < 0.5) out.activity[ts().slice(0, 10)] = 1 + Math.floor(rnd() * 9);
  }
  return out;
}

describe('mergeProgress', () => {
  it('is idempotent, commutative and associative', () => {
    for (let i = 1; i <= 60; i++) {
      const a = randomProgress(i);
      const b = randomProgress(i * 7919);
      const c = randomProgress(i * 104729);
      const ab = mergeProgress(a, b);
      expect(sameProgress(ab, mergeProgress(b, a))).toBe(true);
      expect(sameProgress(mergeProgress(ab, b), ab)).toBe(true);
      expect(sameProgress(mergeProgress(ab, ab), ab)).toBe(true);
      expect(sameProgress(mergeProgress(ab, c), mergeProgress(a, mergeProgress(b, c)))).toBe(true);
    }
  });

  it('keeps the first pass and the highest exam score', () => {
    const merged = mergeProgress(
      p({
        exercises: { x: { attempts: 3, passedAt: '2026-10-05T00:00:00Z' } },
        exams: { e: { attempts: 1, best: 60, lastAt: '2026-10-01T00:00:00Z' } },
      }),
      p({
        exercises: { x: { attempts: 1, passedAt: '2026-10-03T00:00:00Z', revealed: true } },
        exams: { e: { attempts: 2, best: 90, passedAt: '2026-10-04T00:00:00Z', lastAt: '2026-10-04T00:00:00Z' } },
      }),
    );
    expect(merged.exercises.x).toEqual({ attempts: 3, passedAt: '2026-10-03T00:00:00Z', revealed: true });
    expect(merged.exams.e).toMatchObject({ attempts: 2, best: 90, passedAt: '2026-10-04T00:00:00Z' });
  });

  it('a later "solve again" clears an older answer from another device', () => {
    const old = p({ quiz: { q: { choice: 1, correct: true, at: '2026-10-01T00:00:00Z' } } });
    const cleared = p({ quiz: { q: { choice: -1, correct: false, at: '2026-10-02T00:00:00Z', cleared: true } } });
    expect(quizAnswer(mergeProgress(old, cleared), 'q')).toBeUndefined();
    const answeredAgain = p({ quiz: { q: { choice: 2, correct: false, at: '2026-10-03T00:00:00Z' } } });
    expect(quizAnswer(mergeProgress(cleared, answeredAgain), 'q')).toMatchObject({ choice: 2 });
  });

  it('uses an explicitly set start date over automatic ones', () => {
    const auto = p({ startDate: '2026-10-01' });
    const manual = p({ startDate: '2026-10-10', startDateSetAt: '2026-10-10T09:00:00Z' });
    expect(mergeProgress(auto, manual).startDate).toBe('2026-10-10');
    expect(mergeProgress(auto, p({ startDate: '2026-09-30' })).startDate).toBe('2026-09-30');
  });

  it('takes the newer review card', () => {
    const merged = mergeProgress(
      p({ review: { q: { box: 3, due: '2026-10-20', updatedAt: '2026-10-13T00:00:00Z' } } }),
      p({ review: { q: { box: 1, due: '2026-10-15', updatedAt: '2026-10-14T00:00:00Z' } } }),
    );
    expect(merged.review.q.box).toBe(1);
  });
});
