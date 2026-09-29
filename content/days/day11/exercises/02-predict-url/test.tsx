import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { answers } from './main';

/** URL を initial にしてフックを動かし、action の後の URL (queryString) と値を返す */
async function run<T>(initial: string, useHook: () => T, action?: (current: T) => unknown) {
  const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={initial} onUrlUpdate={onUrlUpdate} hasMemory>
      {children}
    </NuqsTestingAdapter>
  );
  const { result, unmount } = renderHook(useHook, { wrapper });
  if (action) {
    // 更新関数は Promise を返す。await すると URL の書き換えまで待てる
    await act(async () => {
      await action(result.current);
    });
  }
  const current = result.current;
  unmount();
  return { url: onUrlUpdate.mock.calls.at(-1)?.[0].queryString ?? initial, current };
}

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const sameValue = (answer: unknown, actual: unknown) => typeof answer === typeof actual && answer === actual;
// URL はキーの順番を問わない (?a=1&b=2 と ?b=2&a=1 は同じとみなす)
const normalize = (query: string) =>
  [...new URLSearchParams(query)]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('&');
const sameUrl = (answer: unknown, actual: string) =>
  typeof answer === 'string' && answer !== '???' && normalize(answer) === normalize(actual);

test('Q1: ?page=abc で withDefault(1) のときの値', async () => {
  const { current } = await run('?page=abc', () => useQueryState('page', parseAsInteger.withDefault(1)));
  expect(sameValue(answers.q1, current[0])).toBe(true);
});

test('Q2: ?page=abc で withDefault なしのときの値', async () => {
  const { current } = await run('?page=abc', () => useQueryState('page', parseAsInteger));
  expect(sameValue(answers.q2, current[0])).toBe(true);
});

test('Q3: setPage(1) の後の URL', async () => {
  const { url } = await run(
    '?page=3&q=ts',
    () => useQueryState('page', parseAsInteger.withDefault(1)),
    ([, setPage]) => setPage(1),
  );
  expect(sameUrl(answers.q3, url)).toBe(true);
});

test("Q4: setParams({ q: 'next', page: null }) の後の URL", async () => {
  const { url } = await run(
    '?scope=mine&page=3&q=react',
    () =>
      useQueryStates({
        scope: parseAsStringLiteral(['all', 'mine', 'team'] as const).withDefault('all'),
        page: parseAsInteger.withDefault(1),
        q: parseAsString,
      }),
    ([, setParams]) => setParams({ q: 'next', page: null }),
  );
  expect(sameUrl(answers.q4, url)).toBe(true);
});

test("Q5: setTags((old) => [...old, 'b']) の後の URL", async () => {
  const { url } = await run(
    '?tags=a',
    () => useQueryState('tags', parseAsArrayOf(parseAsString).withDefault([])),
    ([, setTags]) => setTags((old) => [...old, 'b']),
  );
  expect(sameUrl(answers.q5, url)).toBe(true);
});

test('Q6: setParams(null) の後の URL', async () => {
  const { url } = await run(
    '?view=grid&page=2',
    () => useQueryStates({ page: parseAsInteger.withDefault(1), q: parseAsString }),
    ([, setParams]) => setParams(null),
  );
  expect(sameUrl(answers.q6, url)).toBe(true);
});

test("Q7: setQ('') の後の URL", async () => {
  const { url } = await run(
    '?q=react',
    () => useQueryState('q', parseAsString),
    ([, setQ]) => setQ(''),
  );
  expect(sameUrl(answers.q7, url)).toBe(true);
});
