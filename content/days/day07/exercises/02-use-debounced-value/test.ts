import { renderHook, waitFor } from '@testing-library/react';
import { useDebouncedValue } from './main';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// レンダーのたびに、フックが返した値を history に記録する
function setup(initial: string, delayMs = 100) {
  const history: string[] = [];
  const utils = renderHook(
    ({ value }) => {
      const debounced = useDebouncedValue(value, delayMs);
      history.push(debounced);
      return debounced;
    },
    { initialProps: { value: initial } },
  );
  return { ...utils, history };
}

test('最初は渡した値をそのまま返す', () => {
  const { result } = setup('a');
  expect(result.current).toBe('a');
});

test('値が変わっても、すぐには変わらない', async () => {
  const { result, rerender } = setup('a');
  rerender({ value: 'ab' });
  expect(result.current).toBe('a');
  await sleep(30);
  expect(result.current).toBe('a');
});

test('delayMs たつと新しい値になる', async () => {
  const { result, rerender } = setup('a');
  rerender({ value: 'ab' });
  await waitFor(() => expect(result.current).toBe('ab'));
});

test('delayMs 以内に続けて変わったら、最後の値だけが反映される', async () => {
  const { result, rerender, history } = setup('a');
  rerender({ value: 'ab' });
  await sleep(30);
  rerender({ value: 'abc' });
  await sleep(30);
  rerender({ value: 'abcd' });
  await waitFor(() => expect(result.current).toBe('abcd'));
  await sleep(150);
  expect(history).not.toContain('ab');
  expect(history).not.toContain('abc');
  expect(result.current).toBe('abcd');
});
