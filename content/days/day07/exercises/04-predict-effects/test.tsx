import { useEffect, useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { answers } from './main';

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) =>
  typeof answer === typeof actual && JSON.stringify(answer) === JSON.stringify(actual);

let logs: string[] = [];
const log = (message: string) => {
  logs.push(message);
};
// ログを取り出して空にする
const take = () => {
  const taken = logs;
  logs = [];
  return taken;
};

function Child({ id }: { id: number }) {
  log(`render ${id}`);
  useEffect(() => {
    log(`start ${id}`);
    return () => log(`stop ${id}`);
  }, [id]);
  useEffect(() => {
    log('every');
  });
  return null;
}

// render → rerender(同じ id) → rerender(id=2) の各段階で記録されたログ
function runChild() {
  take();
  const { rerender } = render(<Child id={1} />);
  const q1 = take();
  rerender(<Child id={1} />);
  const q2 = take();
  rerender(<Child id={2} />);
  const q3 = take();
  return { q1, q2, q3 };
}

test('Q1: 最初の render', () => {
  expect(same(answers.q1, runChild().q1)).toBe(true);
});

test('Q2: 同じ id で rerender', () => {
  expect(same(answers.q2, runChild().q2)).toBe(true);
});

test('Q3: id を変えて rerender', () => {
  expect(same(answers.q3, runChild().q3)).toBe(true);
});

function Loader() {
  const [n, setN] = useState(0);
  log(`render ${n}`);
  useEffect(() => {
    setN(1);
  }, []);
  return null;
}

test('Q4: エフェクトの中で setState', () => {
  take();
  render(<Loader />);
  expect(same(answers.q4, take())).toBe(true);
});

function Fetcher({ q }: { q: string }) {
  const options = { q };
  useEffect(() => {
    log('fetch');
  }, [options]);
  return null;
}

function MemoFetcher({ q }: { q: string }) {
  const options = useMemo(() => ({ q }), [q]);
  useEffect(() => {
    log('fetch');
  }, [options]);
  return null;
}

test('Q5: オブジェクトを依存配列に入れる', () => {
  take();
  const { rerender } = render(<Fetcher q="a" />);
  rerender(<Fetcher q="a" />);
  rerender(<Fetcher q="a" />);
  expect(same(answers.q5, take().filter((l) => l === 'fetch').length)).toBe(true);
});

test('Q6: useMemo で作ったオブジェクトを依存配列に入れる', () => {
  take();
  const { rerender } = render(<MemoFetcher q="a" />);
  rerender(<MemoFetcher q="a" />);
  rerender(<MemoFetcher q="a" />);
  expect(same(answers.q6, take().filter((l) => l === 'fetch').length)).toBe(true);
});
