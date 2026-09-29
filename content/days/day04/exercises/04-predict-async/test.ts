import { answers } from './main';

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) =>
  typeof answer === typeof actual &&
  JSON.stringify(answer) === JSON.stringify(actual) &&
  (typeof actual !== 'object' ||
    actual === null ||
    Object.keys(answer as object).join() === Object.keys(actual).join());

/** README のコードを、テストごとに新しく実行する */
function scenario() {
  const log: string[] = [];
  async function task(name: string) {
    log.push(`${name}: start`);
    await Promise.resolve();
    log.push(`${name}: end`);
    return name.toUpperCase();
  }
  log.push('A');
  const p = task('t');
  log.push('B');
  return { log, p, task };
}

test('Q1: await する前の log', async () => {
  const { log, p } = scenario();
  const snapshot = [...log];
  await p;
  expect(same(answers.q1, snapshot)).toBe(true);
});

test('Q2: typeof p', async () => {
  const { p } = scenario();
  const type = typeof p;
  await p;
  expect(same(answers.q2, type)).toBe(true);
});

test('Q3: await p の後の log', async () => {
  const { log, p } = scenario();
  await p;
  expect(same(answers.q3, log)).toBe(true);
});

test('Q4: r の値', async () => {
  const { p } = scenario();
  const r = await p;
  expect(same(answers.q4, r)).toBe(true);
});

test('Q5: Promise.all の結果', async () => {
  const { p, task } = scenario();
  await p;
  const values = await Promise.all([Promise.resolve(1), 2, task('x')]);
  expect(same(answers.q5, values)).toBe(true);
});

test('Q6: message の値', async () => {
  async function safe() {
    try {
      await Promise.reject(new Error('NG'));
      return 'ok';
    } catch (e) {
      return e instanceof Error ? e.message : '不明なエラー';
    }
  }
  expect(same(answers.q6, await safe())).toBe(true);
});
