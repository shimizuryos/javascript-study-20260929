import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { answers } from './main';

// 実際に表示して、画面のテキスト全体を取り出す
const textOf = (ui: ReactNode) => render(<>{ui}</>).container.textContent;

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) => typeof answer === typeof actual && answer === actual;

test('Q1', () => {
  expect(same(answers.q1, textOf(<p>{0 && '在庫あり'}</p>))).toBe(true);
});

test('Q2', () => {
  expect(same(answers.q2, textOf(<p>{[1, 2, 3].map((n) => n * 10)}</p>))).toBe(true);
});

test('Q3', () => {
  expect(
    same(
      answers.q3,
      textOf(
        <p>
          {true}
          {null}
          {undefined}
          {false}完了
        </p>,
      ),
    ),
  ).toBe(true);
});

function Price({ value, unit = '円' }: { value: number; unit?: string }) {
  return (
    <span>
      {value}
      {unit}
    </span>
  );
}

test('Q4', () => {
  expect(same(answers.q4, textOf(<Price value={500} unit="" />))).toBe(true);
});

function Status({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return <p>{items.length > 1 ? '複数あり' : items[0]}</p>;
}

test('Q5', () => {
  const ui = (
    <div>
      <Status items={[]} />
      <Status items={['A']} />
      <Status items={['A', 'B']} />
    </div>
  );
  expect(same(answers.q5, textOf(ui))).toBe(true);
});

test('Q6', () => {
  const count = 0 as number;
  expect(same(answers.q6, textOf(<p>{count > 0 && `${count} 件`}</p>))).toBe(true);
});

test('Q7', () => {
  const ui = (
    <ul>
      {['a', 'b'].map((s, i) => (
        <li key={s}>
          {i}
          {s}
        </li>
      ))}
    </ul>
  );
  expect(same(answers.q7, textOf(ui))).toBe(true);
});
