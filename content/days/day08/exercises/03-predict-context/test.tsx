import { createContext, useContext, type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { answers } from './main';

const textOf = (ui: ReactNode) => render(<>{ui}</>).container.textContent;

// 正解の値そのものがエラーメッセージに出ないように、一致したかどうかだけを見る
const same = (answer: unknown, actual: unknown) => typeof answer === typeof actual && answer === actual;

const ThemeContext = createContext<string | undefined>('light');

function Label() {
  const theme = useContext(ThemeContext);
  return <span>[{theme}]</span>;
}

test('Q1', () => {
  expect(same(answers.q1, textOf(<Label />))).toBe(true);
});

test('Q2', () => {
  const ui = (
    <ThemeContext value="dark">
      <Label />
      <ThemeContext value="blue">
        <Label />
      </ThemeContext>
      <Label />
    </ThemeContext>
  );
  expect(same(answers.q2, textOf(ui))).toBe(true);
});

test('Q3', () => {
  const ui = (
    <>
      <ThemeContext value="dark">
        <Label />
      </ThemeContext>
      <Label />
    </>
  );
  expect(same(answers.q3, textOf(ui))).toBe(true);
});

test('Q4', () => {
  const ui = (
    <ThemeContext.Provider value="green">
      <div>
        <section>
          <Label />
        </section>
      </div>
    </ThemeContext.Provider>
  );
  expect(same(answers.q4, textOf(ui))).toBe(true);
});

test('Q5', () => {
  const ui = (
    <ThemeContext value={undefined}>
      <Label />
    </ThemeContext>
  );
  expect(same(answers.q5, textOf(ui))).toBe(true);
});

function DarkSection({ children }: { children: ReactNode }) {
  return <ThemeContext value="dark">{children}</ThemeContext>;
}

test('Q6', () => {
  const ui = (
    <ThemeContext value="blue">
      <DarkSection>
        <Label />
      </DarkSection>
      <Label />
    </ThemeContext>
  );
  expect(same(answers.q6, textOf(ui))).toBe(true);
});
