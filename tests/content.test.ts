/**
 * 教材の検証。CI で毎回実行される。
 * - すべての演習で「模範解答 (main) はテストに通る」「初期コード (starter) は通らない」
 * - 型チェック演習は、模範解答が型エラー 0 件
 * - クイズ・レッスンの形式が正しい
 */
import { describe, expect, it } from 'vitest';
import {
  getAllDayMeta,
  getDay,
  getExam,
  listDayNumbers,
  listRawExercises,
  readTargetSource,
  type RawExercise,
} from '@/lib/content';
import { runTests } from '@/runner/run';
import { createTypeChecker } from './helpers/typecheck';

const typecheck = createTypeChecker();
const days = listDayNumbers();

function filesFor(ex: RawExercise, mainCode: string) {
  const files: Record<string, string> = { [ex.mainFile]: mainCode };
  for (const f of ex.files) files[f.name] = f.code;
  return files;
}

async function check(ex: RawExercise, code: string) {
  const files = filesFor(ex, code);
  const result = await runTests({ files, entry: ex.testFile, timeoutMs: 5000 });
  const diagnostics = ex.meta.typecheck ? typecheck(files) : [];
  return { result, diagnostics, passed: result.status === 'passed' && diagnostics.length === 0 };
}

describe('content structure', () => {
  it('has days', () => {
    expect(days.length).toBeGreaterThan(0);
  });

  it.each(days)('day %i: lesson, quiz and exam parse', async (day) => {
    const d = await getDay(day);
    expect(d.title).toBeTruthy();
    expect(d.lessonHtml.length).toBeGreaterThan(100);
    const exam = await getExam(day);
    if (d.exam) expect(exam?.quiz.length ?? 0).toBeGreaterThan(0);
  });

  it('target code map is consistent', () => {
    const target = readTargetSource();
    if (!target) return;
    const lineCount = target.code.replace(/\n$/, '').split('\n').length;
    const known = new Set(getAllDayMeta().map((d) => d.day));
    for (const s of target.segments) {
      expect(s.from).toBeGreaterThanOrEqual(1);
      expect(s.to).toBeLessThanOrEqual(lineCount);
      expect(s.from).toBeLessThanOrEqual(s.to);
      expect(known.has(s.day), `segment day ${s.day} exists`).toBe(true);
    }
  });
});

for (const day of days) {
  let all: RawExercise[];
  try {
    const { regular, exam } = listRawExercises(day);
    all = [...regular, ...exam];
  } catch (e) {
    // 1 日分の不備で他の日の検証が止まらないようにする
    describe(`day ${day} exercises`, () => {
      it('can be loaded', () => {
        throw e;
      });
    });
    continue;
  }
  if (all.length === 0) continue;
  describe(`day ${day} exercises`, () => {
    it.each(all.map((ex) => [ex.id, ex] as const))('%s: solution passes', async (_id, ex) => {
      const { result, diagnostics, passed } = await check(ex, ex.solution);
      expect(
        passed,
        JSON.stringify(
          { error: result.error, failed: result.tests.filter((t) => t.status === 'failed'), diagnostics },
          null,
          2,
        ),
      ).toBe(true);
    });
    it.each(all.map((ex) => [ex.id, ex] as const))('%s: starter does not pass', async (_id, ex) => {
      const { passed } = await check(ex, ex.starter);
      expect(passed).toBe(false);
    });
  });
}
